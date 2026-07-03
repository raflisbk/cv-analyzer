"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[WorkspaceError]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F2D8] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#141414]/10 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <svg
            className="h-6 w-6 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-[#141414]">
          Workspace error
        </h2>
        <p className="mt-2 text-sm text-[#141414]/60">
          {error.message || "An error occurred while loading the workspace."}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-full bg-[#141414] px-5 py-2 text-sm font-bold text-[#F5F2D8] transition-colors hover:bg-[#141414]/80"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-[#141414]/15 px-5 py-2 text-sm font-bold text-[#141414]/70 transition-colors hover:bg-[#141414]/5"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
