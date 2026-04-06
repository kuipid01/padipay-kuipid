'use server';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Admin/lender protected and auth routes
const adminProtectedRoutes = ['/dashboard'];
const adminAuthRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

// Borrower protected and auth routes
const borrowerProtectedRoutes = ['/borrower/dashboard'];
const borrowerAuthRoutes = ['/borrower/login', '/borrower/forgot-password'];

// Toggle logs easily
const DEBUG = false;

const log = (...args: any[]) => {
  if (DEBUG) console.log('[MIDDLEWARE]', ...args);
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  log('Incoming request:', pathname);

  const isBorrowerRoute = pathname.startsWith('/borrower');
  log('Route type:', isBorrowerRoute ? 'BORROWER' : 'ADMIN');

  /* ================= BORROWER ================= */
  if (isBorrowerRoute) {
    const borrowerToken = request.cookies.get('borrower_token')?.value;

    log('Borrower token exists:', !!borrowerToken);

    let isBorrowerAuthenticated = false;

    if (borrowerToken) {
      try {
        const payload = await verifyToken(borrowerToken);
        isBorrowerAuthenticated = !!payload;

        log('Borrower token verified:', isBorrowerAuthenticated);
        if (payload) log('Borrower payload:', payload);
      } catch (err) {
        log('Borrower token verification FAILED:', err);
      }
    }

    const isBorrowerProtected = borrowerProtectedRoutes.some(route =>
      pathname === route || pathname.startsWith(`${route}/`)
    );

    const isBorrowerAuth = borrowerAuthRoutes.some(route =>
      pathname === route || pathname.startsWith(`${route}/`)
    );

    log('Borrower route flags:', {
      isBorrowerProtected,
      isBorrowerAuth,
    });

    if (isBorrowerProtected && !isBorrowerAuthenticated) {
      log('Redirecting borrower → login');

      const loginUrl = new URL('/borrower/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);

      return NextResponse.redirect(loginUrl);
    }

    if (isBorrowerAuth && isBorrowerAuthenticated) {
      log('Redirecting borrower → dashboard');

      return NextResponse.redirect(new URL('/borrower/dashboard', request.url));
    }
  }

  /* ================= ADMIN ================= */
  else {
    const token = request.cookies.get('token')?.value;

    log('Admin token exists:', !!token);

    let isAuthenticated = false;

    if (token) {
      try {
        const payload = await verifyToken(token);
        isAuthenticated = !!payload;

        log('Admin token verified:', isAuthenticated);
        if (payload) log('Admin payload:', payload);
      } catch (err) {
        log('Admin token verification FAILED:', err);
      }
    }

    const isAdminProtected = adminProtectedRoutes.some(route =>
      pathname === route || pathname.startsWith(`${route}/`)
    );

    const isAdminAuth = adminAuthRoutes.some(route =>
      pathname === route || pathname.startsWith(`${route}/`)
    );

    log('Admin route flags:', {
      isAdminProtected,
      isAdminAuth,
    });

    if (isAdminProtected && !isAuthenticated) {
      log('Redirecting admin → login');

      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);

      return NextResponse.redirect(loginUrl);
    }

    if (isAdminAuth && isAuthenticated) {
      log('Redirecting admin → dashboard');

      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  log('Request allowed → continuing');

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};