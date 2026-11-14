import en from "./dictionaries/en";
import id from "./dictionaries/id";
import type { Locale } from "./locales";

export type Dictionary = typeof en;
export function getDictionary(locale: Locale) {
  return locale === "id" ? id : en;
}
export function format(template: string, vars: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => String(vars[key] ?? match));
}
export function plural(locale: Locale, count: number, one: string, many: string) {
  return locale === "id" || count === 1 ? one : many;
}
