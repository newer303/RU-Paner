import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // Define public routes that do not require authentication
  const isPublicRoute = 
    pathname.startsWith('/login') || 
    pathname.startsWith('/register') || 
    pathname.startsWith('/forgot-password') || 
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js';

  // If the user is not authenticated and trying to access a protected route, redirect to /login
  if (!token && !isPublicRoute) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

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
     * 
     * We keep it broad here and handle specific public routes (login, register, etc.) 
     * inside the middleware function for better reliability.
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)",
  ],
};
