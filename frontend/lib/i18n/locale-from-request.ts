import { DEFAULT_LOCALE, LOCALES, type Locale } from "./locales";

export function localeFromRequest(
  cookie?: string | null,
  acceptLanguage?: string | null,
): Locale {
  if (cookie && LOCALES.includes(cookie as Locale)) return cookie as Locale;
  const candidates = (acceptLanguage ?? "").split(",").map((part, index) => {
    const [tag, ...params] = part.trim().toLowerCase().split(";");
    const quality = params.find((param) => param.trim().startsWith("q="));
    const q = quality ? Number(quality.trim().slice(2)) : 1;
    return { locale: tag.split("-")[0], q, index };
  });
  candidates.sort((a, b) => b.q - a.q || a.index - b.index);
  return (
    (candidates.find(
      ({ locale, q }) => q > 0 && q <= 1 && LOCALES.includes(locale as Locale),
    )?.locale as Locale) ?? DEFAULT_LOCALE
  );
}
