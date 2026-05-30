import { NextRequest, NextResponse } from "next/server";

import {
  addLocalePrefix,
  getLocaleFromCookieValue,
  getLocaleFromPathname,
  localeCookieName,
  localeHeaderName,
  removeLocalePrefix,
  resolveLocaleFromAcceptLanguage,
  type SiteLocale,
} from "@/lib/i18n";

const cookieMaxAgeSeconds = 60 * 60 * 24 * 365;

function setLocaleCookie(response: NextResponse, locale: SiteLocale) {
  response.cookies.set(localeCookieName, locale, {
    maxAge: cookieMaxAgeSeconds,
    path: "/",
    sameSite: "lax",
  });
}

function shouldBypassLocalization(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/uploads")
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldBypassLocalization(pathname)) {
    return NextResponse.next();
  }

  const localeFromPath = getLocaleFromPathname(pathname);
  const localeFromCookie = getLocaleFromCookieValue(
    request.cookies.get(localeCookieName)?.value,
  );
  const preferredLocale =
    localeFromCookie ?? resolveLocaleFromAcceptLanguage(request.headers.get("accept-language"));

  if (!localeFromPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = addLocalePrefix(pathname, preferredLocale);
    const response = NextResponse.redirect(redirectUrl);
    setLocaleCookie(response, preferredLocale);
    return response;
  }

  const strippedPathname = removeLocalePrefix(pathname);
  if (shouldBypassLocalization(strippedPathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = strippedPathname;
    return NextResponse.redirect(redirectUrl);
  }

  const rewrittenUrl = request.nextUrl.clone();
  rewrittenUrl.pathname = strippedPathname;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(localeHeaderName, localeFromPath);

  const response = NextResponse.rewrite(rewrittenUrl, {
    request: {
      headers: requestHeaders,
    },
  });
  setLocaleCookie(response, localeFromPath);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon\\.svg|.*\\..*).*)"],
};
