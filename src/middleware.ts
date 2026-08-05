import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('couples_session')?.value;
  const { pathname } = request.nextUrl;

  const isPublicPath = pathname === '/login';
  const isApiPath = pathname.startsWith('/api');

  // Allow API requests to handle their own auth checks
  if (isApiPath) {
    return NextResponse.next();
  }

  // If user is not authenticated and trying to access protected route
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and trying to access login page
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
