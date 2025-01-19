import { NextRequest, NextResponse } from 'next/server';
import acceptLanguage from 'accept-language';
import { fallbackLng, languages, cookieName } from './app/i18n/settings';

acceptLanguage.languages(languages);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|favicon.ico).*)',
  ],
};

export function middleware(req: NextRequest) {
  let lng: string | undefined | null;

  // Vérifie si un cookie existe
  if (req.cookies.has(cookieName)) {
    const cookieValue = req.cookies.get(cookieName)?.value;
    if (cookieValue) {
      lng = acceptLanguage.get(cookieValue);
    }
  }

  // Si aucun cookie n'existe, utilise l'en-tête Accept-Language
  if (!lng) {
    const acceptLanguageHeader = req.headers.get('Accept-Language');
    if (acceptLanguageHeader) {
      lng = acceptLanguage.get(acceptLanguageHeader);
    }
  }

  // Définit une langue par défaut si aucune n'est trouvée
  if (!lng) {
    lng = fallbackLng;
  }

  const pathname = req.nextUrl.pathname;

  // Vérifie si la langue est déjà dans l'URL
  const isLanguageInUrl = languages.some((loc) => pathname.startsWith(`/${loc}`));

  // Redirection si la langue n'est pas dans l'URL
  if (!isLanguageInUrl) {
    const newUrl = new URL(`/${lng}${pathname}`, req.url);
    const response = NextResponse.redirect(newUrl);

    // Ajoute la langue dans le cookie
    response.cookies.set(cookieName, lng);
    return response;
  }

  // Met à jour le cookie pour refléter la langue active
  const activeLanguage = pathname.split('/')[1];
  const response = NextResponse.next();
  response.cookies.set(cookieName, activeLanguage);
  return response;
}
