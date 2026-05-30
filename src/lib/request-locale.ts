import { cookies, headers } from "next/headers";

import {
  defaultLocale,
  getLocaleFromCookieValue,
  isSupportedLocale,
  localeCookieName,
  localeHeaderName,
  type SiteLocale,
} from "@/lib/i18n";

export async function getRequestLocale(): Promise<SiteLocale> {
  const requestHeaders = await headers();
  const localeFromHeader = requestHeaders.get(localeHeaderName);
  if (localeFromHeader && isSupportedLocale(localeFromHeader)) {
    return localeFromHeader;
  }

  const requestCookies = await cookies();
  const localeFromCookie = getLocaleFromCookieValue(
    requestCookies.get(localeCookieName)?.value,
  );
  return localeFromCookie ?? defaultLocale;
}

