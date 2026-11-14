"use client";

import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, LOCALES, type Locale } from "@/lib/i18n/locales";
import { useT } from "@/components/i18n/i18n-provider";

export default function LanguageSwitch() {
  const { locale, setLocale, t } = useT();
  const router = useRouter();
  function choose(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    setLocale(next);
    router.refresh();
  }
  return (
    <div
      role="group"
      aria-label={t("nav.language")}
      className="inline-flex rounded-full bg-[var(--brand-snow)] p-1 text-sm font-bold text-[var(--brand-ink)]"
    >
      {LOCALES.map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={locale === item}
          onClick={() => choose(item)}
          className="min-h-10 min-w-10 rounded-full px-2 aria-pressed:bg-[var(--brand-punk)]"
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
