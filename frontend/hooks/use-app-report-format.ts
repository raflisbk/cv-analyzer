"use client";

import { useT } from "@/components/i18n/i18n-provider";

export function useAppReportFormat() {
  const { locale } = useT();
  const intlLocale = locale === "id" ? "id-ID" : "en-US";
  const score = (value: number) =>
    new Intl.NumberFormat(intlLocale).format(value);
  return {
    score,
    delta: (value: number) => `${value >= 0 ? "+" : ""}${score(value)}`,
    date: (value: string) =>
      new Intl.DateTimeFormat(intlLocale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value)),
  };
}
