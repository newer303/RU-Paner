import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log(`[Auth] Request: ${pathname}`);

  // 1. Define public routes
  const isPublicRoute = 
    pathname === '/login' || 
    pathname.startsWith('/register') || 
    pathname.startsWith('/forgot-password') || 
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js';

  try {
    if (isPublicRoute) {
      if (pathname === '/login' || pathname.startsWith('/register')) {
        const token = await getToken({ req });
        if (token) {
          console.log(`[Auth] Authenticated user accessing public route, redirecting to /`);
          return NextResponse.redirect(new URL('/', req.url));
        }
      }
      return NextResponse.next();
    }

    const token = await getToken({ req });
    if (!token) {
      console.log(`[Auth] Unauthenticated user accessing protected route, redirecting to /login`);
      return NextResponse.redirect(new URL('/login', req.url));
    }
    console.log(`[Auth] Authenticated user accessing protected route`);

  } catch (error) {
    console.error(`[Auth] Critical Error:`, error);
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
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
