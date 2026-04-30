import { env } from "@/env";
import { getToken } from 'next-auth/jwt'
import { NextResponse, NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // ----- i18n logic -----
  // Setup cookie if it is missing
  if (!request.cookies.has('NEXT_LOCALE')) {
    const acceptLanguage = request.headers.get('accept-language');
    const locale = acceptLanguage?.includes('th') ? 'th' : 'en';

    // set cookie แล้วไปต่อ
    response.cookies.set('NEXT_LOCALE', locale);
  }

  // Get the pathname of the request
  const { pathname } = request.nextUrl

  // Exclude static paths and API for auth checks
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return response;
  }

  // Only check auth for specific paths
  const isProtectedPath = pathname.startsWith('/dashboard') || pathname.startsWith('/profile') || pathname.startsWith('/subscription') || pathname.startsWith('/admin');

  if (isProtectedPath) {
    const user = await getToken({
      req: request,
      secret: env.NEXTAUTH_SECRET,
    })

    if (!user) {
      const redirectRes = NextResponse.redirect(new URL('/sign-in', request.url));
      // Carry over locale cookie
      if (!request.cookies.has('NEXT_LOCALE')) {

        // set cookie ก่อนส่งไปหน้า sign-in
        redirectRes.cookies.set('NEXT_LOCALE', response.cookies.get('NEXT_LOCALE')!.value);
      }
      return redirectRes;
    }

    // If the pathname starts with /admin and the user is not an admin, redirect to the home page
    if (pathname.startsWith('/admin')) {
      if (user.role === 'ADMIN') {
        return response;
      }
      const redirectHome = NextResponse.redirect(new URL('/', request.url));
      if (!request.cookies.has('NEXT_LOCALE')) {
        redirectHome.cookies.set('NEXT_LOCALE', response.cookies.get('NEXT_LOCALE')!.value);
      }
      return redirectHome;
    }
  }

  // Continue with the request if the user is an admin or the route is not protected
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
