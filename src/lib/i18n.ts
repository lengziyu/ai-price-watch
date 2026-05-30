export const supportedLocales = ["zh-CN", "en"] as const;

export type SiteLocale = (typeof supportedLocales)[number];

export const defaultLocale: SiteLocale = "zh-CN";
export const localeCookieName = "NEXT_LOCALE";
export const localeHeaderName = "x-ai-price-watch-locale";

const localePrefixPattern = /^\/([A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})?)(?:\/|$)/;

export function isSupportedLocale(value: string): value is SiteLocale {
  return (supportedLocales as readonly string[]).includes(value);
}

export function getLocaleFromPathname(pathname: string): SiteLocale | null {
  const match = pathname.match(localePrefixPattern);
  if (!match) {
    return null;
  }

  const candidate = match[1];
  return isSupportedLocale(candidate) ? candidate : null;
}

export function removeLocalePrefix(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);
  if (!locale) {
    return pathname || "/";
  }

  const prefix = `/${locale}`;
  const stripped = pathname.startsWith(prefix)
    ? pathname.slice(prefix.length)
    : pathname;
  return stripped || "/";
}

export function addLocalePrefix(pathname: string, locale: SiteLocale): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const strippedPath = removeLocalePrefix(normalizedPath);

  if (strippedPath === "/") {
    return `/${locale}`;
  }

  return `/${locale}${strippedPath}`;
}

export function getLocaleFromCookieValue(value?: string | null): SiteLocale | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  return isSupportedLocale(normalized) ? normalized : null;
}

export function resolveLocaleFromAcceptLanguage(headerValue?: string | null): SiteLocale {
  if (!headerValue) {
    return defaultLocale;
  }

  const tokens = headerValue
    .split(",")
    .map((token) => token.trim().split(";")[0]?.trim().toLowerCase())
    .filter(Boolean);

  for (const token of tokens) {
    if (token === "zh-cn" || token.startsWith("zh")) {
      return "zh-CN";
    }
    if (token === "en" || token.startsWith("en-")) {
      return "en";
    }
  }

  return defaultLocale;
}

