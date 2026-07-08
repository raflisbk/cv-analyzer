"use client";

import { useEffect, useRef } from "react";
import { loadGsap, type GsapCtx } from "@/lib/gsap-loader";
import Link from "next/link";
import { toast } from "sonner";
import { AccentPill } from "@/components/ui/accent-pill";
import { PathkrInline } from "@/components/ui/pathkr-logo";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const ctxRef = useRef<GsapCtx | null>(null);

  function showComingSoon(feature: string) {
    toast("Coming Soon", {
      description: `${feature} is under development. Drop your email on the product page to get notified!`,
    });
  }

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }
    let ctx: GsapCtx | null = null;
    loadGsap().then(({ gsap }) => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          ".hero-stagger",
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            stagger: 0.12,
            delay: 0.2,
          }
        );

        gsap.fromTo(
          ".hero-cta",
          { opacity: 0, y: 20, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "back.out(1.4)",
            stagger: 0.08,
            delay: 0.8,
          }
        );

        gsap.to(".hero-glow", {
          y: -80,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }, sectionRef);
      ctxRef.current = ctx;
    });
    return () => {
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="snap-section bg-[#F5F2D8]">
      <div className="flex-1 flex items-center justify-center px-4 md:px-8">
        <div
          className="relative overflow-hidden rounded-2xl mx-auto max-w-7xl w-full"
          style={{
            background:
              "linear-gradient(160deg, #201C14 0%, #1A170F 55%, #16130C 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow:
              "0 12px 64px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <div
            aria-hidden="true"
            className="hero-glow pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
          >
            <div
              className="absolute -top-16 left-1/4 h-48 w-80 rounded-full"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(202,255,67,0.14) 0%, transparent 70%)",
                filter: "blur(60px)",
              }}
            />
            <div
              className="absolute top-1/2 right-1/4 h-64 w-64 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(139,92,246,0.10) 0%, transparent 70%)",
                filter: "blur(60px)",
              }}
            />
          </div>

          <div className="relative z-10 px-10 md:px-20 py-8 md:py-10 text-center">
            <p
              className="hero-stagger mb-4 font-display text-sm font-extrabold uppercase tracking-[0.25em]"
              style={{ color: "rgba(245,242,216,0.45)" }}
            >
              <PathkrInline variant="dark" />
            </p>

            <h1 className="hero-stagger font-display text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-[#F5F2D8]">
              Build your{" "}
              <AccentPill color="lime" size="hero">career</AccentPill>{" "}
              <AccentPill color="pink" size="hero">path</AccentPill>{" "}
              with <span className="gradient-text-lime">AI</span>
            </h1>

            <p className="hero-stagger mt-4 mx-auto max-w-xl font-sans text-base md:text-lg leading-relaxed text-[#F5F2D8]/70">
              Score your CV, chat with AI, fix grammar, check ATS compliance,
              and compare against job descriptions — all in one intelligent
              platform.
            </p>

            <p className="hero-stagger mt-3 font-sans text-sm font-semibold tracking-wide text-[#F5F2D8]/40">
              Free · Instant · 6 AI features · EN & ID
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <div className="hero-cta">
                <Link
                  href="/workspace-v2/new"
                  className="group relative overflow-hidden rounded-full px-7 py-3.5 text-sm md:text-base font-extrabold transition-all duration-200 active:scale-[0.98]"
                  style={{
                    background: "#CAFF43",
                    color: "#1a2900",
                    boxShadow:
                      "0 0 0 1px rgba(202,255,67,0.3) inset, 0 4px 16px rgba(202,255,67,0.2)",
                  }}
                >
                  <span className="relative z-10">Analyze My CV</span>
                  <div
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_ease_1]"
                    aria-hidden="true"
                  />
                </Link>
              </div>

              <div className="hero-cta">
                <button
                  onClick={() => showComingSoon("CV Builder")}
                  className="rounded-full px-7 py-3.5 text-sm md:text-base font-extrabold transition-all duration-200 active:scale-[0.98]
                    border border-[#F5F2D8]/15 bg-[#F5F2D8]/[0.05] text-[#F5F2D8]/60
                    hover:border-[#FF8C42]/60 hover:bg-[#FF8C42]/[0.05] hover:text-[#FF8C42]"
                >
                  Build My CV
                </button>
              </div>

              <div className="hero-cta">
                <button
                  onClick={() => showComingSoon("Job Finding")}
                  className="rounded-full px-7 py-3.5 text-sm md:text-base font-extrabold transition-all duration-200 active:scale-[0.98]
                    border border-[#F5F2D8]/15 bg-[#F5F2D8]/[0.05] text-[#F5F2D8]/60
                    hover:border-[#8B5CF6]/60 hover:bg-[#8B5CF6]/[0.05] hover:text-[#8B5CF6]"
                >
                  Find My Job
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
