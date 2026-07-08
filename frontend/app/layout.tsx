import type { Metadata } from "next";

// Self-hosted fonts (no Google Fonts download at build time — the dev
// machine's network kept timing out and pages fell back to system fonts)
import "@fontsource-variable/inter";
import "@fontsource-variable/bricolage-grotesque";

import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "pathkr — AI-Powered Career Tools",
  description: "AI-powered CV analysis, skill gap detection, and job matching. Analyze your CV for free in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
