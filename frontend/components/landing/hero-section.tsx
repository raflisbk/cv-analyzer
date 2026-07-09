"use client";

import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap-loader";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, Scissors, Send } from "lucide-react";
import { AccentPill } from "@/components/ui/accent-pill";
import { PathkrInline } from "@/components/ui/pathkr-logo";

import HeroCvArtifact from "@/components/landing/hero-cv-artifact";


const diamond = (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
    <path d="M4 0L5 3L8 4L5 5L4 8L3 5L0 4L3 3Z" fill="currentColor" />
  </svg>
);

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  // Set only under prefers-reduced-motion: no-preference — the stub
  // tear-off click handler no-ops when this stays null
  const gsapRef = useRef<typeof import("gsap").gsap | null>(null);
  const tearingRef = useRef(false);

  function tearOffStub() {
    const gsap = gsapRef.current;
    const stub = sectionRef.current?.querySelector(".hero-stub");
    if (!gsap || !stub || tearingRef.current) {
      return;
    }
    tearingRef.current = true;
    gsap
      .timeline({
        onComplete: () => {
          tearingRef.current = false;
        },
      })
      .to(stub, {
        rotation: 3,
        y: 10,
        duration: 0.16,
        ease: "power2.in",
        transformOrigin: "left top",
      })
      .to(stub, { y: 90, rotation: 8, opacity: 0, duration: 0.45, ease: "power2.in" })
      .set(stub, { y: -18, rotation: 0 })
      .to(stub, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" })
      .fromTo(
        ".hero-barcode",
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: "left center",
          duration: 0.45,
          ease: "power2.inOut",
        },
        "-=0.15",
      );
  }

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
        gsapRef.current = gsap;
        // Master reveal: the boarding pass "prints" (card rises, barcode
        // prints left→right), then headline/copy/CTAs. Starts when the
        // mascot kicks the card (MASCOT_KICK_EVENT) — or after a fallback
        // timeout on viewports where the mascot is hidden.
        const intro = gsap
          .timeline({ paused: true })
          .from(".hero-card-wrap", {
            y: 90,
            opacity: 0,
            rotation: -1.2,
            transformOrigin: "bottom left",
            duration: 0.8,
            ease: "power3.out",
          })
          .fromTo(
            ".hero-barcode",
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 0.5,
              ease: "power2.inOut",
              transformOrigin: "left center",
            },
            "-=0.25",
          )
          .from(
            ".hero-line",
            {
              yPercent: 115,
              duration: 1.05,
              ease: "power4.out",
              stagger: 0.1,
            },
            "-=0.55",
          )
          .from(
            ".hero-fade",
            {
              opacity: 0,
              y: 24,
              duration: 0.9,
              ease: "power3.out",
              stagger: 0.1,
            },
            "-=0.8",
          )
          .from(
            ".hero-cta",
            {
              opacity: 0,
              y: 16,
              scale: 0.96,
              duration: 0.7,
              ease: "back.out(1.4)",
              stagger: 0.08,
            },
            "-=0.9",
          );

        let started = false;
        const startIntro = () => {
          if (!started) {
            started = true;
            intro.play();
          }
        };
        // The kick has to LAND: besides starting the reveal, the card takes
        // a physical impact shudder (x wiggle — a prop the intro timeline
        // doesn't touch, so the two can overlap safely)
        const onKick = () => {
          startIntro();
          gsap.timeline({ delay: 0.05 }).to(".hero-card-wrap", {
            keyframes: [
              { x: -8, duration: 0.06 },
              { x: 6, duration: 0.06 },
              { x: -4, duration: 0.06 },
              { x: 2, duration: 0.06 },
              { x: 0, duration: 0.1 },
            ],
            ease: "none",
          });
        };
        window.addEventListener("pathkr:mascot-kick", onKick);
        // The mascot (md+ only) takes ~4s to paper-drop in and kick; wait
        // for it where it exists, reveal almost immediately where it doesn't
        const mascotPresent = window.matchMedia("(min-width: 768px)").matches;
        const fallback = window.setTimeout(startIntro, mascotPresent ? 7000 : 400);

        // The mascot conducts these zones when it walks under them
        const onMascotZone = (event: Event) => {
          const zone = (event as CustomEvent).detail?.zone;
          if (zone === "card-stub") {
            // The tap lands on the card itself: it hops up and settles
            gsap
              .timeline()
              .to(".hero-card-wrap", {
                y: -10,
                rotation: 0.5,
                transformOrigin: "bottom center",
                duration: 0.16,
                ease: "power2.out",
                overwrite: "auto",
              })
              .to(".hero-card-wrap", {
                y: 0,
                rotation: 0,
                duration: 0.7,
                ease: "elastic.out(1, 0.45)",
              });
            const stub = sectionRef.current?.querySelector(".hero-stub");
            if (stub) {
              gsap.fromTo(
                ".hero-stub-sweep",
                { x: 0 },
                { x: stub.clientWidth + 160, duration: 0.9, ease: "power2.inOut" },
              );
            }
            gsap.fromTo(
              ".hero-dot",
              { scale: 1 },
              { scale: 2, duration: 0.14, yoyo: true, repeat: 5 },
            );
          } else if (zone === "hero-rows") {
            // Domino from the BOTTOM row — the mascot taps the block from
            // below, so the nearest row reacts first. Explicit up-then-down
            // timeline; overwrite kills any tween still holding y on these
            // elements (e.g. the intro reveal).
            gsap
              .timeline()
              .to(".hero-row", {
                y: -6,
                duration: 0.22,
                stagger: { each: 0.16, from: "end" },
                ease: "power2.out",
                overwrite: "auto",
              })
              .to(".hero-row", {
                y: 0,
                duration: 0.35,
                stagger: { each: 0.16, from: "end" },
                ease: "bounce.out",
              });
            gsap.fromTo(
              ".row-no",
              { backgroundColor: "rgba(202,255,67,0)", color: "rgba(17,17,17,0.35)" },
              {
                backgroundColor: "#CAFF43",
                color: "#141414",
                duration: 0.25,
                stagger: { each: 0.16, from: "end" },
                yoyo: true,
                repeat: 1,
                clearProps: "backgroundColor,color",
              },
            );
          } else if (zone === "hero-stamp") {
            gsap.fromTo(
              ".hero-stamp",
              { scale: 1.45, rotation: -10, opacity: 0.4 },
              {
                scale: 1,
                rotation: 0,
                opacity: 1,
                duration: 0.55,
                ease: "elastic.out(1, 0.5)",
              },
            );
          }
        };
        window.addEventListener("pathkr:mascot-zone", onMascotZone);
        return () => {
          gsapRef.current = null;
          window.removeEventListener("pathkr:mascot-zone", onMascotZone);
          window.removeEventListener("pathkr:mascot-kick", onKick);
          window.clearTimeout(fallback);
        };
      });
    });

    return () => {
      mm?.revert();
    };
  }, []);

  return (
    <section id="hero" ref={sectionRef} className="snap-section relative bg-[#F5F2D8]">
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
          {/* Dashed flight path flying off toward the right edge (ticket
              motif) — the manifesto it used to land on now heads the RAG
              explainer section below */}
          <div className="relative ml-10 hidden h-10 flex-1 self-end xl:block">
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
        </div>

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:gap-6 xl:mx-0 xl:max-w-none xl:grid-cols-[minmax(0,760px)_1fr]">
          {/* Left: dark hero card shaped like a boarding pass — side notches
              + perforation line above the marquee "tear-off stub".
              Shadow lives on the unmasked wrapper (the mask would clip it). */}
          <div
            className="hero-card-wrap relative w-full rounded-2xl"
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
              <div className="relative z-10 grid items-center gap-8 px-6 pt-10 pb-8 md:grid-cols-[1.1fr_0.9fr] md:px-12 md:pt-12 lg:grid-cols-1 lg:px-10 lg:pr-44 xl:px-12 xl:pr-48">
                {/* min-w-0: let the column shrink below its content's
                    min-content width so the card never overflows on mobile */}
                <div className="min-w-0">
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

              {/* Tear-off ticket stub: barcode + boarding info.
                  Mascot zone: walking under the card "scans" the barcode.
                  Clicking tears it off along the perforation and reprints. */}
              <div
                data-mascot-zone="card-stub"
                role="button"
                tabIndex={0}
                aria-label="Tear off and reprint the boarding stub"
                onClick={tearOffStub}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    tearOffStub();
                  }
                }}
                className="hero-stub relative z-10 flex h-11 cursor-pointer items-center justify-between gap-4 overflow-hidden px-6 md:px-10"
                style={{ borderTop: "2px dashed rgba(245,242,216,0.16)" }}
              >
                {/* Scan sweep played when the mascot passes */}
                <span
                  aria-hidden="true"
                  className="hero-stub-sweep pointer-events-none absolute inset-y-0 -left-24 w-20"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(202,255,67,0.22), transparent)",
                  }}
                />
                {/* Barcode + seat hide on the smallest screens so the stub
                    row's min-content never widens the card past the viewport */}
                <div
                  aria-hidden="true"
                  className="hero-barcode hidden h-5 w-24 flex-none opacity-45 sm:block"
                  style={{
                    background:
                      "repeating-linear-gradient(90deg, #F5F2D8 0 2px, transparent 2px 4px, #F5F2D8 4px 5px, transparent 5px 9px, #F5F2D8 9px 12px, transparent 12px 14px, #F5F2D8 14px 15px, transparent 15px 18px)",
                  }}
                />
                <div className="flex items-center gap-3 whitespace-nowrap text-[9px] font-black uppercase tracking-[0.2em] text-[#F5F2D8]/40 md:gap-5 md:text-[10px]">
                  <span>Gate AI</span>
                  <span className="hidden text-[#CAFF43]/40 sm:inline">
                    {diamond}
                  </span>
                  <span className="hidden sm:inline">Seat 01-A</span>
                  <span className="text-[#CAFF43]/40">{diamond}</span>
                  <span className="flex items-center gap-1.5 text-[#CAFF43]/80">
                    <span className="hero-dot h-1.5 w-1.5 animate-pulse rounded-full bg-[#CAFF43]" />
                    Boarding Now
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: "Why it works" — three big interactive rows that
              double as story navigation (each scrolls to its section).
              xl+ only — below that the CV artifact needs the room. */}
          <div className="relative hidden xl:flex flex-col items-end justify-center pr-10">
            {/* Ornaments filling the gap between the CV artifact and the
                rows (only when the gap actually exists, ≥1780px): ticket
                perforation + scissors framing the rows as a tear-off stub,
                a dashed trajectory from the artifact toward the rows, and a
                slowly rotating passport stamp */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-10 left-0 right-[400px] 2xl:right-[480px] hidden 2xl:block"
            >
              {/* Perforation line just left of the rows */}
              <div className="absolute inset-y-8 right-0 border-r border-dashed border-[#141414]/15" />
              <Scissors className="absolute -right-2 top-2 h-4 w-4 rotate-90 text-[#141414]/25" />

              {/* Dashed trajectory: artifact → rows */}
              <svg
                className="absolute left-[6%] top-[24%] hidden h-40 w-[76%] min-[1780px]:block"
                viewBox="0 0 400 160"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M8 132 Q 180 8 392 64"
                  stroke="rgba(17,17,17,0.16)"
                  strokeWidth="1.5"
                  strokeDasharray="5 7"
                />
                <circle cx="392" cy="64" r="3" fill="rgba(17,17,17,0.3)" />
                <circle
                  cx="8"
                  cy="132"
                  r="2.5"
                  stroke="rgba(17,17,17,0.3)"
                  strokeWidth="1.5"
                />
              </svg>

              {/* Rotating passport stamp */}
              <div
                data-mascot-zone="hero-stamp"
                className="hero-stamp absolute left-[30%] top-[54%] hidden h-28 w-28 min-[1780px]:block"
              >
                <svg
                  className="h-full w-full"
                  viewBox="0 0 112 112"
                  style={{ animation: "hero-spin 45s linear infinite" }}
                >
                  <defs>
                    <path
                      id="hero-stamp-arc"
                      d="M56,56 m-41,0 a41,41 0 1,1 82,0 a41,41 0 1,1 -82,0"
                      fill="none"
                    />
                  </defs>
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    stroke="rgba(17,17,17,0.22)"
                    strokeWidth="1.5"
                    strokeDasharray="4 6"
                    fill="none"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="32"
                    stroke="rgba(17,17,17,0.16)"
                    strokeWidth="1"
                    fill="none"
                  />
                  <text
                    fontSize="9.5"
                    fontWeight="800"
                    letterSpacing="2.5"
                    fill="rgba(17,17,17,0.3)"
                  >
                    <textPath href="#hero-stamp-arc">
                      PATH KARIR ✦ CAREER PASS ✦ APPROVED
                    </textPath>
                  </text>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-black text-[#141414]/30">
                  87
                </span>
              </div>

              {/* Scattered plus marks + micro meta */}
              <svg
                className="absolute left-[14%] top-[14%] hidden min-[1780px]:block"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M7 1v12M1 7h12"
                  stroke="rgba(17,17,17,0.25)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <svg
                className="absolute left-[64%] top-[80%]"
                width="10"
                height="10"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M7 1v12M1 7h12"
                  stroke="rgba(17,17,17,0.18)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute left-[52%] top-[8%] hidden min-[1780px]:block font-mono text-[9px] tracking-[0.3em] text-[#141414]/25">
                GATE AI → ROWS 01–03
              </span>
              <span
                className="absolute bottom-[6%] left-[18%] hidden min-[1780px]:block"
                style={{ animation: "hero-spin 38s linear infinite reverse" }}
              >
                <svg width="11" height="11" viewBox="0 0 8 8" fill="none">
                  <path
                    d="M4 0L5 3L8 4L5 5L4 8L3 5L0 4L3 3Z"
                    fill="rgba(17,17,17,0.22)"
                  />
                </svg>
              </span>
            </div>

            <div
              data-mascot-zone="hero-rows"
              className="w-full max-w-[340px] 2xl:max-w-[420px]"
            >
              <p className="hero-fade mb-2 flex items-center justify-end gap-2.5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#141414]/40">
                Why it works
                <span aria-hidden="true" className="text-[#141414]/30">
                  {diamond}
                </span>
              </p>
              {[
                {
                  no: "01",
                  title: "Score",
                  copy: "Four dimensions, judged by an AI ensemble — not a keyword counter.",
                  target: "rag-explainer",
                },
                {
                  no: "02",
                  title: "Fix",
                  copy: "Grammar, impact, ATS — rewritten with you, right inside the editor.",
                  target: "see-it-in-action",
                },
                {
                  no: "03",
                  title: "Match",
                  copy: "Measured against the job you're actually chasing, not an average one.",
                  target: "features",
                },
              ].map((row) => (
                <button
                  key={row.no}
                  type="button"
                  aria-label={`${row.title} — jump to section`}
                  onClick={() =>
                    document
                      .getElementById(row.target)
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hero-fade hero-row group block w-full border-t border-dashed border-[#141414]/20 py-5 text-right"
                >
                  <p className="mb-1.5 font-mono text-[10px] tracking-[0.2em] text-[#141414]/35">
                    <span className="row-no rounded-sm px-1 py-0.5 transition-colors duration-200 group-hover:bg-[#CAFF43] group-hover:text-[#141414]">
                      {row.no}
                    </span>
                  </p>
                  <p className="flex items-center justify-end gap-3">
                    <span className="font-display text-3xl font-extrabold leading-none tracking-tight text-[#141414] transition-transform duration-300 group-hover:-translate-x-1 2xl:text-4xl">
                      {row.title}
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="h-5 w-5 -translate-x-2 text-[#141414] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#141414]/55">
                    {row.copy}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* CV artifact straddling the card's right edge (lg+) — the hero's
              featured animation now that the RAG graph lives in its own
              section below; slightly scaled up to own the open space */}
          <div className="pointer-events-none absolute left-[62%] top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 scale-105 lg:block xl:left-[760px] xl:scale-[1.18]">
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
