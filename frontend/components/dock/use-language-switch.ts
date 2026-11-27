"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/i18n/i18n-provider";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/locales";

const FADE_MS = 170;
const FADE_ATTRIBUTE = "localeFade";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function writeLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function useLanguageSwitch() {
  const { locale, setLocale } = useT();
  const router = useRouter();
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => window.clearTimeout(timer));
      delete document.documentElement.dataset[FADE_ATTRIBUTE];
    };
  }, []);

  const later = useCallback((action: () => void, delay: number) => {
    timers.current.push(window.setTimeout(action, delay));
  }, []);

  const choose = useCallback(
    (next: Locale) => {
      if (next === locale) {
        return;
      }
      const root = document.documentElement;
      const apply = () => {
        writeLocaleCookie(next);
        root.lang = next;
        setLocale(next);
      };
      if (prefersReducedMotion()) {
        apply();
        later(() => router.refresh(), 0);
        return;
      }
      root.dataset[FADE_ATTRIBUTE] = "out";
      later(() => {
        apply();
        delete root.dataset[FADE_ATTRIBUTE];
        later(() => router.refresh(), FADE_MS);
      }, FADE_MS);
    },
    [locale, router, setLocale, later],
  );

  return { locale, choose };
}
