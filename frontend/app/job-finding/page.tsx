import type { Metadata } from "next";
import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/landing/navbar";
import { PathkrLogo } from "@/components/ui/pathkr-logo";

export const metadata: Metadata = {
  title: "Job Finding — pathkr",
  description: "Find roles that match your skills.",
};

export default function JobFindingPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#F5F2D8] min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 text-center">

        {/* Dark card */}
        <div className="bg-[#141414] rounded-[2rem] px-10 py-12 max-w-sm w-full mx-auto flex flex-col items-center">

          {/* Icon */}
          <Search className="w-16 h-16 text-[#8B5CF6]" />

          {/* Coming Soon badge */}
          <span className="mt-4 rounded-full px-4 py-1 text-xs font-normal bg-[#F5F2D8]/10 text-[#F5F2D8]/50">
            Coming Soon
          </span>

          {/* Heading */}
          <h1 className="font-display font-extrabold text-2xl text-[#F5F2D8] mt-4 mb-2">
            Job Finding
          </h1>

          {/* Tagline */}
          <p className="text-sm text-[#F5F2D8]/60 max-w-xs leading-relaxed">
            Discover job opportunities matched to your CV and skills.
          </p>

          {/* Email input */}
          <input
            type="email"
            placeholder="Enter your email for early access"
            aria-label="Email address for early access notification"
            className="w-full px-4 py-3 rounded-xl bg-[#F5F2D8]/10 border border-[#F5F2D8]/10
                       text-sm text-[#F5F2D8] placeholder:text-[#F5F2D8]/30
                       focus:outline-none focus:ring-2 focus:ring-[#CAFF43]/50 mt-6"
          />

          {/* Notify Me two-part button */}
          <div className="flex items-center gap-2 mt-3 w-full">
            <button className="flex-1 rounded-full bg-[#CAFF43] text-[#141414] text-sm font-extrabold
                               py-3 px-5 hover:bg-[#CAFF43]/85 transition-colors">
              Notify Me
            </button>
            <button
              aria-label="Submit email"
              className="w-12 h-12 rounded-full bg-[#F5F2D8]/10 flex items-center justify-center
                         flex-shrink-0 hover:bg-[#F5F2D8]/20 transition-colors"
            >
              <ArrowRight className="w-4 h-4 text-[#F5F2D8]" />
            </button>
          </div>

        </div>

        {/* Back link */}
        <Link href="/" className="mt-8 text-sm text-[#141414]/50 hover:text-[#141414] transition-colors inline-flex items-center gap-1.5">
          ← Back to <PathkrLogo size="sm" variant="light" />
        </Link>

      </main>
    </>
  );
}
