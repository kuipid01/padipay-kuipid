import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Admin/lender protected and auth routes
const adminProtectedRoutes = ['/dashboard'];
const adminAuthRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

// Borrower protected and auth routes
const borrowerProtectedRoutes = ['/borrower/dashboard'];
const borrowerAuthRoutes = ['/borrower/login', '/borrower/forgot-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isBorrowerRoute = pathname.startsWith('/borrower');

  if (isBorrowerRoute) {
    // --- Borrower route: validate borrower_token ---
    const borrowerToken = request.cookies.get('borrower_token')?.value;
    let isBorrowerAuthenticated = false;
    if (borrowerToken) {
      const payload = await verifyToken(borrowerToken);
      isBorrowerAuthenticated = !!payload;
    }

    const isBorrowerProtected = borrowerProtectedRoutes.some(route =>
      pathname === route || pathname.startsWith(`${route}/`)
    );
    const isBorrowerAuth = borrowerAuthRoutes.some(route =>
      pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isBorrowerProtected && !isBorrowerAuthenticated) {
      const loginUrl = new URL('/borrower/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isBorrowerAuth && isBorrowerAuthenticated) {
      return NextResponse.redirect(new URL('/borrower/dashboard', request.url));
    }
  } else {
    // --- Admin/lender route: validate token ---
    const token = request.cookies.get('token')?.value;
    let isAuthenticated = false;
    if (token) {
      const payload = await verifyToken(token);
      isAuthenticated = !!payload;
    }

    const isAdminProtected = adminProtectedRoutes.some(route =>
      pathname === route || pathname.startsWith(`${route}/`)
    );
    const isAdminAuth = adminAuthRoutes.some(route =>
      pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isAdminProtected && !isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdminAuth && isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
