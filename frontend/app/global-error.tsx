"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F2D8] px-4 text-center">
          <h1 className="text-4xl font-black tracking-tight text-[#141414]">
            Something went wrong
          </h1>
          <p className="mt-3 max-w-md text-sm text-[#141414]/60">
            An unexpected error occurred. We apologize for the inconvenience.
          </p>
          <button
            onClick={reset}
            className="mt-6 rounded-full bg-[#141414] px-6 py-2.5 text-sm font-bold text-[#F5F2D8] transition-colors hover:bg-[#141414]/80"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
