"use client";

import { useEffect } from "react";
import { useT } from "@/components/i18n/i18n-provider";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useT();
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary]", error);
    }
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F5F2D8] px-4 text-center">
      <div className="rounded-2xl border border-[#141414]/10 bg-white p-8 shadow-sm">
        <h2 className="text-lg font-bold text-[#141414]">
          {t("errors.boundary.title")}
        </h2>
        <p className="mt-2 text-sm text-[#141414]/60">
          {t("errors.boundary.body")}
        </p>
        <button
          onClick={reset}
          className="mt-5 rounded-full bg-[#141414] px-5 py-2 text-sm font-bold text-[#F5F2D8] transition-colors hover:bg-[#141414]/80"
        >
          {t("errors.boundary.retry")}
        </button>
      </div>
    </main>
  );
}
