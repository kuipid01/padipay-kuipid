import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Define protected and auth routes
const protectedRoutes = ['/dashboard', '/borrower/dashboard'];
const authRoutes = [
  '/login', '/register', '/forgot-password', '/reset-password',
  '/borrower/login', '/borrower/forgot-password'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Check if user is authenticated
  let isAuthenticated = false;
  if (token) {
    const payload = await verifyToken(token);
    isAuthenticated = !!payload;
  }
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Check if it's a borrower route
  const isBorrowerRoute = pathname.startsWith('/borrower');
  
  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginPath = isBorrowerRoute ? '/borrower/login' : '/login';
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirect authenticated users trying to access auth routes
  if (isAuthRoute && isAuthenticated) {
    const dashboardPath = isBorrowerRoute ? '/borrower/dashboard' : '/dashboard';
    return NextResponse.redirect(new URL(dashboardPath, request.url));
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
