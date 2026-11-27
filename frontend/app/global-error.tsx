"use client";

import { useEffect, useState } from "react";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "@/lib/i18n/locales";
import { localeFromRequest } from "@/lib/i18n/locale-from-request";
import { getDictionary } from "@/lib/i18n/translate";

function cookieLocale(): Locale {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`),
  );
  return localeFromRequest(match?.[1], navigator.language);
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const copy = getDictionary(locale).errors.boundary;
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);
  useEffect(() => {
    setLocale(cookieLocale());
  }, []);

  return (
    <html lang={locale}>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F2D8] px-4 text-center">
          <h1 className="text-4xl font-black tracking-tight text-[#141414]">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-md text-sm text-[#141414]/60">
            {copy.globalBody}
          </p>
          <button
            onClick={reset}
            className="mt-6 rounded-full bg-[#141414] px-6 py-2.5 text-sm font-bold text-[#F5F2D8] transition-colors hover:bg-[#141414]/80"
          >
            {copy.retry}
          </button>
        </div>
      </body>
    </html>
  );
}
