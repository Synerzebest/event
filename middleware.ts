import { NextRequest, NextResponse } from "next/server";
import acceptLanguage from "accept-language";
import { fallbackLng, languages, cookieName } from "./app/i18n/settings";

acceptLanguage.languages(languages);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico|google47fe9171773f6dde.html|robots.txt|ads.txt).*)"],
};

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ✅ Si c'est ads.txt, on ne fait rien, on laisse Next.js gérer normalement
  if (pathname === "/ads.txt") {
    return NextResponse.next();
  }

  let lng: string | undefined | null;

  // 🔍 Vérifier si un cookie existe
  const cookieLng = req.cookies.get(cookieName)?.value;
  if (cookieLng && languages.includes(cookieLng)) {
    lng = cookieLng; // ✅ Garder la langue du cookie
  }

  // 🌍 Si aucun cookie, prendre l'en-tête Accept-Language
  if (!lng) {
    const acceptLanguageHeader = req.headers.get("Accept-Language");
    if (acceptLanguageHeader) {
      lng = acceptLanguage.get(acceptLanguageHeader);
    }
  }

  // 🛑 Si toujours pas de langue, utiliser la valeur par défaut
  if (!lng) {
    lng = fallbackLng;
  }

  const isLanguageInUrl = languages.some((loc) => pathname.startsWith(`/${loc}`));

  // 🌍 Si la langue n'est pas dans l'URL, rediriger
  if (!isLanguageInUrl) {
    const newUrl = new URL(`/${lng}${pathname}`, req.url);
    const response = NextResponse.redirect(newUrl);

    // ✅ Mettre à jour le cookie uniquement si nécessaire
    if (cookieLng !== lng) {
      response.cookies.set(cookieName, lng, { path: "/" });
    }
    return response;
  }

  // ✅ Si la langue est déjà dans l'URL, mettre à jour le cookie si nécessaire
  const activeLanguage = pathname.split("/")[1];
  const response = NextResponse.next();
  if (cookieLng !== activeLanguage) {
    response.cookies.set(cookieName, activeLanguage, { path: "/" });
  }

  return response;
}
