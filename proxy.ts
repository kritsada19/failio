import { getToken } from 'next-auth/jwt'
import { NextResponse, NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const user = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Get the pathname of the request
  const { pathname } = request.nextUrl

  if (!user) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // If the pathname starts with /protected an d the user is not an admin, redirect to the home page
  if (pathname.startsWith('/admin')) {
    if (user.role === 'ADMIN') {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Continue with the request if the user is an admin or the route is not protected
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
