import type { ReactNode } from "react";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import type { Locale } from "@/lib/i18n/locales";

export function withLocale(ui: ReactNode, locale: Locale = "en") {
  return (
    <ThemeProvider initialTheme="light">
      <I18nProvider initialLocale={locale}>{ui}</I18nProvider>
    </ThemeProvider>
  );
}
