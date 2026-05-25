import { env } from "@/env";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import GithubProvider from "next-auth/providers/github";
import { signInSchema } from "@/lib/validations/auth";
import { tokenSchema } from "@/lib/validations/auth";
import { sessionSchema } from "@/lib/validations/auth";
import { redis } from "@/lib/redis";
import crypto from "crypto";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: string;
      plan?: string;
    };
  }

  interface User {
    id: string;
    role?: string;
    plan?: string;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    sessionId: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "john@doe.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        const result = signInSchema.safeParse(credentials);

        if (!result.success) {
          throw new Error("Invalid email or password");
        }

        const { email, password } = result.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        // ถ้าไม่ได้ยืนยันอีเมล
        if (!user.emailVerified) {
          throw new Error("Please verify your email first");
        }

        if (!user.password) {
          throw new Error(
            "This account uses social login. Please sign in with Google, Facebook, or GitHub."
          );
        }

        const failedLoginKey = `failed_login:${email}`;

        // ✅ เช็ค rate limit ก่อนเลย — ไม่ต้องแตะ bcrypt ถ้าโดนบล็อกแล้ว
        const failedLoginCount = await redis.get(failedLoginKey);
        if (Number(failedLoginCount) >= 5) {
          throw new Error("Too many failed login attempts. Please try again later.");
        }

        console.log(failedLoginCount)

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          // ✅ ไม่ประกาศ key ซ้ำ
          const count = await redis.incr(failedLoginKey);
          if (count === 1) {
            await redis.expire(failedLoginKey, 60 * 15); // 15 นาที
          }
          throw new Error("Invalid email or password");
        }

        // ✅ login สำเร็จ → ล้าง counter
        await redis.del(failedLoginKey);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user?.role,
          plan: (user as { plan?: string })?.plan,
        };
      },
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,

      // แปลงข้อมูลจาก Google เป็น user object
      profile(profile) {
        return {
          // id เฉพาะของ Google
          id: profile.sub,

          name: `${profile.given_name} ${profile.family_name}`,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    FacebookProvider({
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,

      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture?.data?.url,
        };
      },
    }),
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,

      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
  ],

  // ไม่เก็บ session ใน DB
  // ใช้ token แทน
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 24 ชั่วโมง
  },

  callbacks: {
    // token = JWT ปัจจุบัน
    // user = จะมีค่า เฉพาะตอน login ครั้งแรก
    // หลัง login สำเร็จ PrismaAdapter จะสร้าง user ใน DB และ return user object มาให้ ทั้ง credentials และ providers อื่นๆ
    async jwt({ token, user }) {
      // ทำไมต้องเช็ค if (user)
      // login สำเร็จ (credentials หรือ google)
      // หลังจากนั้น refresh หน้า → จะไม่มี user แล้ว
      if (user) {
        const sessionId = crypto
          .randomBytes(32)
          .toString("hex");

        // เก็บ session id ลง JWT
        token.sessionId = sessionId;

        // เก็บ session id ลง Redis
        // พร้อมกับเก็บข้อมูล user
        await redis.set(
          `session:${sessionId}`,
          JSON.stringify({
            id: user.id,
            role: user.role,
            plan: user.plan,
          }),
          "EX",
          60 * 60 * 24
        );
      }

      const validatedToken = tokenSchema.safeParse(token);
      if (!validatedToken.success) {
        throw new Error("Invalid token structure");
      }

      return token;
    },

    // session = object ที่จะถูกส่งไป frontend
    async session({ session, token }) {
      if (!session.user || !token.sessionId) return session

      try {
        const raw = await redis.get(`session:${token.sessionId}`);

        if (!raw) {
          return session
        }

        const userObj = sessionSchema.parse(JSON.parse(raw));

        session.user.id = userObj.id;
        session.user.role = userObj.role;
        session.user.plan = userObj.plan;

      } catch {
        // ลบ session เพื่อบังคับให้ login ใหม่
        await redis.del(`session:${token.sessionId}`);
        return session;
      }

      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.sessionId) {
        try {
          await redis.del(`session:${token.sessionId}`);
        } catch (error) {
          console.error("Error deleting Redis session on signOut:", error);
        }
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
