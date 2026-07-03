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
      <div
        className="relative overflow-hidden rounded-[2rem] mx-auto max-w-6xl px-8 md:px-16 py-16 md:py-24"
        style={{
          background: "linear-gradient(160deg, #201C14 0%, #1A170F 55%, #16130C 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 12px 64px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
          <div
            className="absolute -top-24 left-1/4 h-64 w-96 rounded-full"
            style={{
              background: "radial-gradient(ellipse at center, rgba(202,255,67,0.15) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div
            className="absolute top-1/2 right-1/4 h-80 w-80 -translate-y-1/2 rounded-full"
            style={{
              background: "radial-gradient(ellipse at center, rgba(139,92,246,0.1) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </div>

        <div className="absolute top-12 right-[15%] h-5 w-5 rounded-full bg-[#CAFF43] opacity-80 mix-blend-screen blur-[1px]" aria-hidden="true" />
        <div className="absolute top-20 right-[25%] h-3 w-3 rounded-full bg-[#FF4FCB] opacity-60 mix-blend-screen" aria-hidden="true" />
        <div className="absolute top-10 right-[35%] h-8 w-8 rounded-full bg-[#FF8C42] opacity-40 mix-blend-screen blur-[2px]" aria-hidden="true" />
        <div className="absolute bottom-16 left-[10%] h-4 w-4 rounded-full bg-[#8B5CF6] opacity-50 mix-blend-screen" aria-hidden="true" />
        <div className="absolute bottom-10 left-[25%] h-6 w-6 rounded-full bg-[#F5F2D8] opacity-20 mix-blend-screen blur-[1px]" aria-hidden="true" />

        <div className="relative z-10">
          <p className="mb-6 font-display text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: "rgba(245,242,216,0.4)" }}>
            <PathkrInline variant="dark" />
          </p>

          <h1 className="font-display text-5xl md:text-6xl lg:text-[5rem] xl:text-[5.5rem] font-extrabold leading-[1.05] tracking-tight text-[#F5F2D8]">
            Build your{" "}
            <AccentPill color="lime" size="hero">career</AccentPill>
            <br />
            <AccentPill color="pink" size="hero">path</AccentPill>
            {" "}with AI
          </h1>

          <p className="mt-8 max-w-xl font-sans text-lg md:text-xl leading-relaxed text-[#F5F2D8]/70">
            Analyze your CV, build a standout resume, and discover jobs that
            match your skills — all in one intelligent platform.
          </p>

          <p className="mt-3 font-sans text-sm font-semibold tracking-wide text-[#F5F2D8]/40">
            Free. Instant. Built for your success.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-3">
            <Link
              href="/workspace-v2/new"
              className="group relative overflow-hidden rounded-full px-8 py-3.5 text-base font-extrabold transition-all duration-200 active:scale-[0.98]"
              style={{
                background: "#CAFF43",
                color: "#1a2900",
                boxShadow: "0 0 0 1px rgba(202,255,67,0.3) inset, 0 4px 16px rgba(202,255,67,0.2)",
              }}
            >
              <span className="relative z-10">Analyze My CV</span>
              <div
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_ease_1]"
                aria-hidden="true"
              />
            </Link>

            <button
              onClick={() => showComingSoon("CV Builder")}
              className="rounded-full px-8 py-3.5 text-base font-extrabold transition-all duration-200 active:scale-[0.98]
                border border-[#F5F2D8]/15 bg-[#F5F2D8]/[0.05] text-[#F5F2D8]/60
                hover:border-[#FF8C42]/60 hover:bg-[#FF8C42]/[0.05] hover:text-[#FF8C42]"
            >
              Build My CV
            </button>

            <button
              onClick={() => showComingSoon("Job Finding")}
              className="rounded-full px-8 py-3.5 text-base font-extrabold transition-all duration-200 active:scale-[0.98]
                border border-[#F5F2D8]/15 bg-[#F5F2D8]/[0.05] text-[#F5F2D8]/60
                hover:border-[#8B5CF6]/60 hover:bg-[#8B5CF6]/[0.05] hover:text-[#8B5CF6]"
            >
              Find My Job
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
