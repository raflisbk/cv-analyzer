import type { Metadata } from "next";

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

export const metadata: Metadata = {
  icons: { icon: "/landing/logo/pathkr-icon.svg" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = localeFromRequest(
    (await cookies()).get(LOCALE_COOKIE)?.value,
    (await headers()).get("accept-language"),
  );
  return (
    <html lang={locale}>
      <body className="font-sans antialiased">
        <I18nProvider initialLocale={locale}>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </QueryProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
