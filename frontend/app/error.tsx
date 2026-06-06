"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary]", error);
    }
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F5F2D8] px-4 text-center">
      <div className="rounded-2xl border border-[#141414]/10 bg-white p-8 shadow-sm">
        <h2 className="text-lg font-bold text-[#141414]">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-[#141414]/60">
          {error.message || "An unexpected error occurred while loading this page."}
        </p>
        <button
          onClick={reset}
          className="mt-5 rounded-full bg-[#141414] px-5 py-2 text-sm font-bold text-[#F5F2D8] transition-colors hover:bg-[#141414]/80"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
