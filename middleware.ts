import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

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
    // For public routes, we only need the token if we want to redirect authenticated users away from login/register
    if (isPublicRoute) {
      // Only check token for login/register pages to redirect to dashboard
      if (pathname === '/login' || pathname.startsWith('/register')) {
        const token = await getToken({ req });
        if (token) {
          return NextResponse.redirect(new URL('/', req.url));
        }
      }
      return NextResponse.next();
    }

    // 2. For protected routes, verify authentication
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

  } catch (error) {
    console.error(`[Middleware] Critical Error:`, error);
    // Fallback: if an error occurs on a protected route, redirect to login
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
