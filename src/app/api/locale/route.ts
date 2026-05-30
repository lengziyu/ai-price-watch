import { NextRequest, NextResponse } from "next/server";

import {
  defaultLocale,
  isSupportedLocale,
  localeCookieName,
  type SiteLocale,
} from "@/lib/i18n";

const cookieMaxAgeSeconds = 60 * 60 * 24 * 365;

function normalizeRedirectTarget(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return `/${defaultLocale}`;
  }

  return value;
}

export function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get("locale");
  const redirectParam = request.nextUrl.searchParams.get("redirect");

  const locale: SiteLocale =
    localeParam && isSupportedLocale(localeParam) ? localeParam : defaultLocale;
  const redirectTarget = normalizeRedirectTarget(redirectParam);

  const response = new NextResponse(null, {
    status: 307,
    headers: {
      Location: redirectTarget,
    },
  });
  response.cookies.set(localeCookieName, locale, {
    maxAge: cookieMaxAgeSeconds,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
