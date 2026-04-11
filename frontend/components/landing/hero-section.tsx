"use client";

import Link from "next/link";
import { toast } from "sonner";
import { AccentPill } from "@/components/ui/accent-pill";
import { PathkrInline } from "@/components/ui/pathkr-logo";

export default function HeroSection() {
  function showComingSoon(feature: string) {
    toast("Coming Soon", {
      description: `${feature} is under development. Drop your email on the product page to get notified!`,
    });
  }

  return (
    <section className="bg-[#F5F2D8] px-4 md:px-8 py-6 md:py-8">
      <div className="bg-[#141414] rounded-[2rem] max-w-6xl mx-auto px-8 md:px-16 py-16 md:py-24 overflow-hidden relative">

        {/* Decorative circles — aria-hidden */}
        <div className="absolute top-8 right-12 w-5 h-5 rounded-full bg-[#CAFF43] opacity-80" aria-hidden="true" />
        <div className="absolute top-16 right-24 w-3 h-3 rounded-full bg-[#FF4FCB] opacity-60" aria-hidden="true" />
        <div className="absolute top-6 right-40 w-8 h-8 rounded-full bg-[#FF8C42] opacity-40" aria-hidden="true" />
        <div className="absolute bottom-10 left-8 w-4 h-4 rounded-full bg-[#8B5CF6] opacity-50" aria-hidden="true" />
        <div className="absolute bottom-6 left-20 w-6 h-6 rounded-full bg-white opacity-20" aria-hidden="true" />

        {/* Brand name */}
        <p className="font-display font-extrabold text-[#F5F2D8]/40 text-sm tracking-widest uppercase mb-4">
          <PathkrInline variant="dark" />
        </p>

        {/* Platform headline */}
        <h1 className="font-display font-extrabold text-[#F5F2D8] leading-[1.2] text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight">
          Build your{" "}
          <AccentPill color="lime" size="hero">career</AccentPill>
          <br />
          <AccentPill color="pink" size="hero">path</AccentPill>
          {" "}with AI
        </h1>

        {/* Sub-headline */}
        <p className="font-sans text-base md:text-lg text-[#F5F2D8]/70 mt-6 max-w-lg leading-relaxed">
          Analyze your CV, build a standout resume, and discover jobs that
          match your skills — all in one platform.
        </p>

        {/* Descriptor */}
        <p className="font-sans text-sm text-[#F5F2D8]/50 mt-2">
          Free. Instant. Built for your career.
        </p>

        {/* Product CTAs */}
        <div className="flex flex-wrap items-center gap-3 mt-10">

          {/* CV Analyzer — active */}
          <Link
            href="/cv-analyzer"
            className="rounded-full bg-[#F5F2D8] text-[#141414] font-extrabold text-base
                       px-7 py-3 hover:bg-white transition-colors duration-150"
          >
            Analyze My CV
          </Link>

          {/* CV Builder — coming soon */}
          <button
            onClick={() => showComingSoon("CV Builder")}
            className="rounded-full border border-[#F5F2D8]/20 text-[#F5F2D8]/50 font-extrabold
                       text-base px-7 py-3 hover:border-[#FF8C42]/60 hover:text-[#FF8C42]
                       transition-all duration-150"
          >
            Build My CV
          </button>

          {/* Job Finding — coming soon */}
          <button
            onClick={() => showComingSoon("Job Finding")}
            className="rounded-full border border-[#F5F2D8]/20 text-[#F5F2D8]/50 font-extrabold
                       text-base px-7 py-3 hover:border-[#8B5CF6]/60 hover:text-[#8B5CF6]
                       transition-all duration-150"
          >
            Find My Job
          </button>

        </div>

      </div>
    </section>
  );
}
