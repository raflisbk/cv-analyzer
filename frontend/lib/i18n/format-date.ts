import type { Locale } from "./locales";
import { format, getDictionary } from "./translate";

const DAY_MS = 86400000;
const INTL_LOCALE: Record<Locale, string> = { id: "id-ID", en: "en-US" };

export function formatMonthYear(locale: Locale, value: string): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function relativeDate(
  locale: Locale,
  value: string,
  now = Date.now(),
): string {
  const words = getDictionary(locale).app.date;
  const days = Math.max(
    0,
    Math.floor((now - new Date(value).getTime()) / DAY_MS),
  );
  if (days === 0) {
    return words.today;
  }
  if (days === 1) {
    return words.yesterday;
  }
  if (days < 7) {
    return format(words.daysAgo, { count: days });
  }
  if (days < 60) {
    return words.lastMonth;
  }
  return formatMonthYear(locale, value);
}

export function fileMeta(
  locale: Locale,
  role: string | null,
  verb: string,
  date: string,
): string {
  const noRole = getDictionary(locale).app.date.noRole;
  return `${role ?? noRole} · ${verb} ${relativeDate(locale, date)}`;
}
