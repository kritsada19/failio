import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import GithubProvider from "next-auth/providers/github";

declare module "next-auth" {
  interface Session {
    user: {
      id: number | string;
      name?: string | null;
      email?: string | null;
      role?: string;
    };
  }

  interface User {
    id: number | string;
    role?: string;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id?: number | string;
    role?: string;
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
        confirmPassword: {
          label: "Confirm Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password ||
          !credentials?.confirmPassword
        ) {
          return null;
        }

        if (credentials.password !== credentials.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (!user.password) {
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user?.role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,

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
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,

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
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,

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
    maxAge: 60 * 60, // 1 ชั่วโมง
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
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    // session = object ที่จะถูกส่งไป frontend
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
