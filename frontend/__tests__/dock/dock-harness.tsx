import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import type { Locale } from "@/lib/i18n/locales";

export function DockHarness({
  children,
  locale = "en",
}: {
  children: ReactNode;
  locale?: Locale;
}) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider initialTheme="light">
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
