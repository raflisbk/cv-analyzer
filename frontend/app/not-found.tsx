"use client";

import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";

export default function NotFound() {
  const { t } = useT();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F5F2D8] px-4 text-center">
      <div className="rounded-2xl border border-[#141414]/10 bg-white p-8 shadow-sm">
        <h1 className="text-6xl font-black tracking-tighter text-[#141414]">
          404
        </h1>
        <p className="mt-2 text-sm text-[#141414]/60">
          {t("errors.boundary.notFound")}
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-[#141414] px-6 py-2.5 text-sm font-bold text-[#F5F2D8] transition-colors hover:bg-[#141414]/80"
        >
          {t("errors.boundary.home")}
        </Link>
      </div>
    </main>
  );
}
