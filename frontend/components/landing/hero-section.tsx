"use client";

import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap-loader";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, Send } from "lucide-react";
import dynamic from "next/dynamic";
import { AccentPill } from "@/components/ui/accent-pill";
import { PathkrInline } from "@/components/ui/pathkr-logo";

import HeroCvArtifact from "@/components/landing/hero-cv-artifact";

// three.js chunk only loads in the browser, and only on this page
const HeroRagNodes = dynamic(
  () => import("@/components/landing/hero-rag-nodes"),
  {
    ssr: false,
  },
);

const diamond = (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
    <path d="M4 0L5 3L8 4L5 5L4 8L3 5L0 4L3 3Z" fill="currentColor" />
  </svg>
);

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  function showComingSoon(feature: string) {
    toast("Coming Soon", {
      description: `${feature} is under development. Drop your email on the product page to get notified!`,
    });
  }

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }
    let mm: { revert: () => void } | null = null;

    loadGsap().then(({ gsap }) => {
      if (!sectionRef.current) {
        return;
      }
      const media = gsap.matchMedia(sectionRef);
      mm = media;

      media.add("(prefers-reduced-motion: no-preference)", () => {
        // Editorial per-line reveal: lines slide up out of clipped wrappers.
        gsap.from(".hero-line", {
          yPercent: 115,
          duration: 1.05,
          ease: "power4.out",
          stagger: 0.1,
          delay: 0.15,
        });

        gsap.from(".hero-fade", {
          opacity: 0,
          y: 24,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.1,
          delay: 0.55,
        });

        gsap.from(".hero-cta", {
          opacity: 0,
          y: 16,
          scale: 0.96,
          duration: 0.7,
          ease: "back.out(1.4)",
          stagger: 0.08,
          delay: 0.8,
        });
      });
    });

    return () => {
      mm?.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="snap-section relative bg-[#F5F2D8]">
      {/* Slowly spinning diamond accents */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-[8%] top-[10%] hidden lg:block"
        style={{ animation: "hero-spin 26s linear infinite" }}
      >
        <svg width="18" height="18" viewBox="0 0 8 8" fill="none">
          <path
            d="M4 0L5 3L8 4L5 5L4 8L3 5L0 4L3 3Z"
            fill="rgba(17,17,17,0.35)"
          />
        </svg>
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[14%] left-[46%] hidden lg:block"
        style={{ animation: "hero-spin 34s linear infinite reverse" }}
      >
        <svg width="12" height="12" viewBox="0 0 8 8" fill="none">
          <path
            d="M4 0L5 3L8 4L5 5L4 8L3 5L0 4L3 3Z"
            fill="rgba(17,17,17,0.28)"
          />
        </svg>
      </span>

      <div className="flex-1 flex flex-col justify-start gap-4 px-4 pt-5 md:px-8 md:pt-6">
        {/* Editorial band above the card: stacked meta (left) +
            typographic manifesto (right) */}
        <div className="hero-fade hidden items-end justify-between gap-8 md:flex">
          <div className="flex flex-col gap-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#141414]/40">
            <span className="flex items-center gap-2.5">
              <span className="text-[#141414]/30">{diamond}</span>
              AI Career Platform
            </span>
            <span>Score · Fix · Match</span>
          </div>
          {/* Dashed flight path bridging meta → manifesto (ticket motif) */}
          <div className="relative mx-10 hidden h-10 flex-1 self-end xl:block">
            <svg
              aria-hidden="true"
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 400 40"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M4 34 Q 200 -8 388 16"
                stroke="rgba(17,17,17,0.2)"
                strokeWidth="1.5"
                strokeDasharray="5 7"
              />
            </svg>
            <Send
              aria-hidden="true"
              className="absolute -right-1 top-1 h-3.5 w-3.5 rotate-12 text-[#141414]/35"
            />
          </div>

          <div className="max-w-2xl text-right">
            <p className="font-display text-2xl font-extrabold leading-tight tracking-tight text-[#141414] lg:text-3xl">
              An AI that actually knows you.
            </p>
            <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#141414]/40">
              Powered by RAG — every node below is you
            </p>
          </div>
        </div>

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:gap-6 xl:mx-0 xl:max-w-none xl:grid-cols-[minmax(0,760px)_1fr]">
          {/* Left: dark hero card shaped like a boarding pass — side notches
              + perforation line above the marquee "tear-off stub".
              Shadow lives on the unmasked wrapper (the mask would clip it). */}
          <div
            className="relative w-full rounded-2xl"
            style={{ boxShadow: "0 12px 64px rgba(0,0,0,0.18)" }}
          >
            <div
              className="relative overflow-hidden rounded-2xl w-full"
              style={{
                background:
                  "linear-gradient(160deg, #201C14 0%, #1A170F 55%, #16130C 100%)",
                border: "1px solid rgba(255,255,255,0.07)",
                maskImage:
                  "radial-gradient(circle 14px at 0 calc(100% - 44px), transparent 13px, black 14px), radial-gradient(circle 14px at 100% calc(100% - 44px), transparent 13px, black 14px)",
                WebkitMaskImage:
                  "radial-gradient(circle 14px at 0 calc(100% - 44px), transparent 13px, black 14px), radial-gradient(circle 14px at 100% calc(100% - 44px), transparent 13px, black 14px)",
                maskComposite: "intersect",
                WebkitMaskComposite: "source-in",
              }}
            >
              {/* Ticket route header */}
              <div
                aria-hidden="true"
                className="absolute right-6 top-6 z-10 hidden items-center gap-2.5 font-sans text-[9px] font-bold uppercase tracking-[0.3em] text-[#F5F2D8]/30 lg:flex"
              >
                <span>CV</span>
                <ArrowRight className="h-3 w-3 text-[#CAFF43]/60" />
                <span>Hired</span>
                <span className="text-[#F5F2D8]/15">|</span>
                <span>Career Pass Nº 2026</span>
              </div>

              {/* Inner grid: copy + 2D CV artifact side by side on md–lg.
                From lg up the artifact moves to the overlay straddling the
                card's right edge (see below), so copy takes the full width
                with right padding reserved for the overlay. */}
              <div className="relative z-10 grid items-center gap-8 px-8 pt-10 pb-8 md:grid-cols-[1.1fr_0.9fr] md:px-12 md:pt-12 lg:grid-cols-1 lg:px-10 lg:pr-44 xl:px-12 xl:pr-48">
                <div>
                  <p className="hero-fade mb-5 font-display text-sm font-extrabold uppercase tracking-[0.25em] text-[#F5F2D8]/45">
                    <PathkrInline variant="dark" />
                  </p>

                  <h1 className="font-display text-5xl md:text-6xl xl:text-7xl font-extrabold leading-[1.06] tracking-tight text-[#F5F2D8]">
                    <span className="block overflow-hidden py-[0.06em]">
                      <span className="hero-line block">Build your</span>
                    </span>
                    <span className="block overflow-hidden py-[0.06em]">
                      <span className="hero-line block">
                        <AccentPill color="lime" size="hero">
                          career
                        </AccentPill>{" "}
                        <AccentPill color="pink" size="hero">
                          path
                        </AccentPill>
                      </span>
                    </span>
                    <span className="block overflow-hidden py-[0.06em]">
                      <span className="hero-line block">
                        with <span className="gradient-text-lime">AI</span>
                      </span>
                    </span>
                  </h1>

                  <p className="hero-fade mt-5 max-w-md font-sans text-base md:text-lg leading-relaxed text-[#F5F2D8]/70">
                    Score your CV, chat with AI, fix grammar, check ATS
                    compliance, and compare against job descriptions — all in
                    one intelligent platform.
                  </p>

                  <div className="hero-fade mt-5 flex flex-wrap gap-2">
                    {[
                      "Free",
                      "Instant results",
                      "6 AI features",
                      "EN & ID",
                    ].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[#F5F2D8]/15 px-3 py-1 text-[11px] font-bold tracking-wide text-[#F5F2D8]/50"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <div className="hero-cta">
                      <Link
                        href="/workspace-v2/new"
                        className="group relative flex items-center gap-2.5 overflow-hidden rounded-full px-6 py-3 text-sm md:text-base font-extrabold transition-all duration-200 active:scale-[0.98]"
                        style={{
                          background: "#CAFF43",
                          color: "#1a2900",
                          boxShadow:
                            "0 0 0 1px rgba(202,255,67,0.3) inset, 0 4px 16px rgba(202,255,67,0.2)",
                        }}
                      >
                        <span className="relative z-10">Analyze My CV</span>
                        <span
                          className="relative z-10 flex h-6 w-6 flex-none items-center justify-center rounded-full"
                          style={{ background: "#1a2900" }}
                        >
                          <ArrowRight
                            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                            style={{ color: "#CAFF43" }}
                            aria-hidden="true"
                          />
                        </span>
                        <div
                          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_ease_1]"
                          aria-hidden="true"
                        />
                      </Link>
                    </div>

                    <div className="hero-cta">
                      <button
                        onClick={() => showComingSoon("CV Builder")}
                        className="group flex items-center gap-1.5 py-2 text-sm font-extrabold text-[#F5F2D8]/55 transition-colors duration-200 hover:text-[#FF8C42]"
                      >
                        Build My CV
                        <ArrowRight
                          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </button>
                    </div>

                    <div className="hero-cta">
                      <button
                        onClick={() => showComingSoon("Job Finding")}
                        className="group flex items-center gap-1.5 py-2 text-sm font-extrabold text-[#F5F2D8]/55 transition-colors duration-200 hover:text-[#8B5CF6]"
                      >
                        Find My Job
                        <ArrowRight
                          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2D self-analyzing CV artifact inside the card (md–lg only) */}
                <div className="hidden md:flex lg:hidden items-center justify-center">
                  <HeroCvArtifact />
                </div>
              </div>

              {/* Tear-off ticket stub: barcode + boarding info */}
              <div
                className="relative z-10 flex h-11 items-center justify-between gap-4 overflow-hidden px-6 md:px-10"
                style={{ borderTop: "2px dashed rgba(245,242,216,0.16)" }}
              >
                <div
                  aria-hidden="true"
                  className="h-5 w-24 flex-none opacity-45"
                  style={{
                    background:
                      "repeating-linear-gradient(90deg, #F5F2D8 0 2px, transparent 2px 4px, #F5F2D8 4px 5px, transparent 5px 9px, #F5F2D8 9px 12px, transparent 12px 14px, #F5F2D8 14px 15px, transparent 15px 18px)",
                  }}
                />
                <div className="flex items-center gap-3 whitespace-nowrap text-[9px] font-black uppercase tracking-[0.2em] text-[#F5F2D8]/40 md:gap-5 md:text-[10px]">
                  <span>Gate AI</span>
                  <span className="text-[#CAFF43]/40">{diamond}</span>
                  <span>Seat 01-A</span>
                  <span className="text-[#CAFF43]/40">{diamond}</span>
                  <span className="flex items-center gap-1.5 text-[#CAFF43]/80">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#CAFF43]" />
                    Boarding Now
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: interactive RAG personalization graph, outside the card */}
          <div className="relative hidden h-[480px] lg:block xl:h-[540px]">
            {/* Typographic watermark behind the graph */}
            <div
              aria-hidden="true"
              className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
            >
              <span
                className="select-none whitespace-nowrap font-display font-black uppercase tracking-tight"
                style={{
                  fontSize: "clamp(72px, 9vw, 150px)",
                  WebkitTextStroke: "2px rgba(17,17,17,0.09)",
                  color: "transparent",
                }}
              >
                For You
              </span>
            </div>
            <div className="relative z-10 h-full w-full">
              <HeroRagNodes />
            </div>
          </div>

          {/* CV artifact straddling the card's right edge (lg+): the CV
              visually "feeds" the RAG graph beside it */}
          <div className="pointer-events-none absolute left-[58%] top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 lg:block xl:left-[680px]">
            {/* Ornament behind the CV: dashed scan rings + plus marks */}
            <svg
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2"
              width="400"
              height="400"
              viewBox="0 0 400 400"
              fill="none"
            >
              <circle
                cx="200"
                cy="200"
                r="158"
                stroke="rgba(17,17,17,0.12)"
                strokeWidth="1.5"
                strokeDasharray="6 8"
              />
              <circle
                cx="200"
                cy="200"
                r="190"
                stroke="rgba(17,17,17,0.07)"
                strokeWidth="1"
                strokeDasharray="2 10"
              />
              <path
                d="M46 90h14M53 83v14"
                stroke="rgba(17,17,17,0.25)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M348 128h12M354 122v12"
                stroke="rgba(17,17,17,0.2)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M64 316h12M70 310v12"
                stroke="rgba(17,17,17,0.2)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M336 300l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"
                fill="rgba(17,17,17,0.2)"
              />
            </svg>
            <div className="pointer-events-auto">
              <HeroCvArtifact />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
