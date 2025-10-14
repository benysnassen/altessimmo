import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Routes protégées
  const protectedRoutes = ['/dashboard'];
  const { pathname } = request.nextUrl;

  // Vérifier si la route est protégée
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Vérifier simplement la présence du cookie admin-token
  const token = request.cookies.get('admin-token')?.value;

  if (!token) {
    // Rediriger vers la page de login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // La validation complète du token se fait côté serveur dans les API routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/admin/:path*'
  ]
};
