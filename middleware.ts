import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // 1. Immediate pass for assets and auth API
  if (
    pathname.startsWith('/_next') || 
    pathname.includes('/api/auth') ||
    pathname === '/favicon.ico' || 
    pathname === '/manifest.json' || 
    pathname === '/sw.js'
  ) {
    return NextResponse.next();
  }

  // 2. Priority: If it's a public route, allow it immediately
  // This is the critical part to break the loop
  if (
    pathname.startsWith('/login') || 
    pathname.startsWith('/register') || 
    pathname.startsWith('/forgot-password') || 
    pathname.startsWith('/reset-password')
  ) {
    return NextResponse.next();
  }

  // 3. Authentication Check
  // If no token is found, redirect all other requests (including root '/') to /login
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 4. Authenticated users can access everything else
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth
     * - _next/static
     * - _next/image
     * - favicon.ico
     * - manifest.json
     * - sw.js
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)",
  ],
};
