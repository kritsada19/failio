// import env variables เช่น NEXTAUTH_SECRET
import { env } from "@/env";

// ใช้ดึง JWT token จาก next-auth
import { getToken } from 'next-auth/jwt';

// ใช้จัดการ request / response ของ Next.js
import { NextResponse, NextRequest } from 'next/server';

// redis client
import { redis } from "@/lib/redis";

// schema สำหรับ validate session data
import { sessionSchema } from "@/lib/validations/auth";


// ฟังก์ชัน redirect พร้อม set locale cookie
function redirectWithLocale(
  url: URL,
  request: NextRequest,
  response: NextResponse
) {

  // สร้าง redirect response
  const res = NextResponse.redirect(url);

  // ถ้ายังไม่มี cookie NEXT_LOCALE
  if (!request.cookies.has('NEXT_LOCALE')) {

    // copy locale จาก response เดิมมาใส่
    res.cookies.set(
      'NEXT_LOCALE',
      response.cookies.get('NEXT_LOCALE')!.value
    );
  }

  return res;
}


// middleware หลัก
export async function proxy(request: NextRequest) {

  // response ปกติ (ให้ request ไปต่อ)
  const response = NextResponse.next();

  // ---------------------------
  // จัดการ locale language
  // ---------------------------

  // ถ้ายังไม่มี locale cookie
  if (!request.cookies.has('NEXT_LOCALE')) {

    // อ่านภาษาจาก browser
    const acceptLanguage = request.headers.get('accept-language');

    // ถ้ามีภาษาไทย => th
    // ถ้าไม่ใช่ => en
    const locale =
      acceptLanguage?.includes('th')
        ? 'th'
        : 'en';

    // set cookie locale
    response.cookies.set('NEXT_LOCALE', locale);
  }

  // path ปัจจุบัน
  const { pathname } = request.nextUrl;

  // ---------------------------
  // ข้าม path ที่ไม่ต้องตรวจ auth
  // ---------------------------

  // _next => static files ของ next.js
  // api => api routes
  // . => ไฟล์ เช่น favicon.ico
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return response;
  }

  // ---------------------------
  // path ที่ต้อง login
  // ---------------------------

  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/admin');

  // ถ้าเป็น protected route
  if (isProtectedPath) {

    // ดึง JWT token จาก cookie
    const token = await getToken({
      req: request,
      secret: env.NEXTAUTH_SECRET
    });

    // ถ้าไม่มี sessionId => ยังไม่ได้ login
    if (!token?.sessionId) {

      // redirect ไป sign-in
      return redirectWithLocale(
        new URL('/sign-in', request.url),
        request,
        response
      );
    }

    try {

      // ดึง session จาก redis
      const raw = await redis.get(
        `session:${token.sessionId}`
      );

      // ถ้าไม่มี session ใน redis
      if (!raw) {

        // อาจ logout แล้ว / session หมดอายุ
        return redirectWithLocale(
          new URL('/sign-in', request.url),
          request,
          response
        );
      }

      // parse JSON + validate schema
      const user = sessionSchema.parse(
        JSON.parse(raw as string)
      );

      // ---------------------------
      // ตรวจ admin permission
      // ---------------------------

      // ถ้าเข้า /admin แต่ role ไม่ใช่ ADMIN
      if (
        pathname.startsWith('/admin') &&
        user.role !== 'ADMIN'
      ) {

        // เด้งกลับหน้าแรก
        return redirectWithLocale(
          new URL('/', request.url),
          request,
          response
        );
      }

    } catch {

      // ถ้า redis error / parse error
      // ถือว่า session ใช้ไม่ได้
      return redirectWithLocale(
        new URL('/sign-in', request.url),
        request,
        response
      );
    }
  }

  // ผ่านทุกอย่าง => เข้า page ได้
  return response;
}


// config ของ middleware
export const config = {

  // ใช้ middleware กับทุก route
  // ยกเว้น:
  // - api
  // - _next
  // - _vercel
  // - ไฟล์ static
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};