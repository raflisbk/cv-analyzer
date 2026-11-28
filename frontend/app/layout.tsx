import type { Metadata, Viewport } from "next";

// Self-hosted fonts (no Google Fonts download at build time — the dev
// machine's network kept timing out and pages fell back to system fonts)
import "@fontsource-variable/inter";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/caveat/600.css";

import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { cookies, headers } from "next/headers";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { LOCALE_COOKIE } from "@/lib/i18n/locales";
import { localeFromRequest } from "@/lib/i18n/locale-from-request";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeInitScript } from "@/components/theme/theme-init-script";
import {
  THEME_COOKIE,
  parseTheme,
  type Theme,
} from "@/components/theme/theme-cookie";

export const metadata: Metadata = {
  icons: { icon: "/landing/logo/pathkr-icon.svg" },
};

async function themeFromRequest(): Promise<Theme> {
  return parseTheme((await cookies()).get(THEME_COOKIE)?.value) ?? "light";
}

export async function generateViewport(): Promise<Viewport> {
  return { colorScheme: await themeFromRequest() };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = localeFromRequest(
    (await cookies()).get(LOCALE_COOKIE)?.value,
    (await headers()).get("accept-language"),
  );
  const theme = await themeFromRequest();
  return (
    <html
      lang={locale}
      data-theme={theme}
      style={{ colorScheme: theme }}
      suppressHydrationWarning
    >
      <head>
        <ThemeInitScript />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider initialTheme={theme}>
          <I18nProvider initialLocale={locale}>
            <QueryProvider>
              <AuthProvider>
                {children}
                <Toaster />
              </AuthProvider>
            </QueryProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
