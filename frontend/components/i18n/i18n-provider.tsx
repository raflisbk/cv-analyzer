"use client";

import { createContext, useContext, useMemo, useState } from "react";
import en from "@/lib/i18n/dictionaries/en";
import { format, getDictionary } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/locales";

type Vars = Record<string, string | number>;
type ContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Vars) => string;
};
const Context = createContext<ContextValue | null>(null);
const warned = new Set<string>();

function lookup(source: object, key: string): unknown {
  return key
    .split(".")
    .reduce<unknown>(
      (value, part) =>
        value && typeof value === "object"
          ? (value as Record<string, unknown>)[part]
          : undefined,
      source,
    );
}

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocale] = useState(initialLocale);
  const value = useMemo<ContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => {
        const translated = lookup(getDictionary(locale), key);
        if (
          typeof translated !== "string" &&
          process.env.NODE_ENV === "development" &&
          !warned.has(key)
        ) {
          console.warn(`Missing translation: ${key}`);
          warned.add(key);
        }
        const text =
          typeof translated === "string" ? translated : lookup(en, key);
        return typeof text === "string" ? format(text, vars) : key;
      },
    }),
    [locale],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useT() {
  const value = useContext(Context);
  if (!value) throw new Error("useT must be used within I18nProvider");
  return value;
}
