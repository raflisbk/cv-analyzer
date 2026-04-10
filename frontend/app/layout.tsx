import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { UploadModalProvider } from "@/components/providers/upload-modal-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

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
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <QueryProvider>
          <UploadModalProvider>
            {children}
            <Toaster />
          </UploadModalProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
