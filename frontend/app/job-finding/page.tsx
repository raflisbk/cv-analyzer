import type { Metadata } from "next";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/landing/navbar";

export const metadata: Metadata = {
  title: "Job Finding — Path Karir",
  description: "Find roles that match your skills.",
};

export default function JobFindingPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#F5F2D8] min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-[#141414] border-y border-dashed border-[#F5F2D8]/25 px-10 py-12 max-w-sm w-full mx-auto flex flex-col items-center">
          <Search className="w-16 h-16 text-[#8B5CF6]" />

          <span className="mt-4 rounded-full px-4 py-1 text-xs font-normal bg-[#F5F2D8]/10 text-[#F5F2D8]/50">
            Coming Soon
          </span>

          <h1 className="font-display font-extrabold text-2xl text-[#F5F2D8] mt-4 mb-2">
            Job Finding
          </h1>

          <p className="text-sm text-[#F5F2D8]/60 max-w-xs leading-relaxed">
            Discover job opportunities matched to your CV and skills.
          </p>

          <p className="mt-6 text-xs text-[#F5F2D8]/40">
            We&apos;re building this next. Start with CV Analyzer for actionable
            feedback.
          </p>
          <Link
            href="/cv-analyzer"
            className="mt-5 inline-flex rounded-full bg-[#CAFF43] px-5 py-2.5 text-sm font-extrabold text-[#141414] transition-colors hover:bg-[#CAFF43]/85"
          >
            Open CV Analyzer
          </Link>
        </div>

        <Link
          href="/"
          className="mt-8 text-sm text-[#141414]/50 hover:text-[#141414] transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Path Karir
        </Link>
      </main>
    </>
  );
}
