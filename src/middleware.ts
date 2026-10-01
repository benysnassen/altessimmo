import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_ROUTES = ["/dashboard"];
// Routes admin non traduites. Absente d'ici, une page hors de [locale] part
// dans next-intl, qui la prefixe d'une locale — et 404, la page n'existant pas
// sous [locale]. C'est ce qui rendait /admin-setup inaccessible.
const ADMIN_ROUTES = ["/login", "/dashboard", "/admin-setup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Si c'est une route admin, ne pas appliquer i18n
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  if (isAdminRoute) {
    // Vérifier l'authentification pour les routes protégées
    const isProtected = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route),
    );

    if (isProtected) {
      const token = request.cookies.get("admin-token")?.value;

      if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    return NextResponse.next();
  }

  // La racine est servie par src/app/page.tsx : elle renvoie un 200 avec les
  // balises OG, puis redirige. Sans ça, next-intl la redirige en 307 vers /fr/
  // et les crawlers d'aperçu (WhatsApp, Facebook) n'ont aucune balise à lire.
  if (pathname === "/") {
    return NextResponse.next();
  }
  
  // 2. Pour les autres routes, appliquer i18n
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/(fr|en|es|ar)/:path*",
    "/login",
    "/contact",
    "/dashboard/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
