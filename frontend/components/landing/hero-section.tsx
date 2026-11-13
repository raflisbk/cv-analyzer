"use client";

import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap-loader";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { AccentPill } from "@/components/ui/accent-pill";
import { PathkrInline } from "@/components/ui/pathkr-logo";

import HeroCvArtifact from "@/components/landing/hero-cv-artifact";

export const HERO_INTRO_FALLBACK_MS = 700;
export const CARD_PUNCH_ROTATION_MS = 2400;
export const CARD_PUNCH_X_SETTLE_MS = 1500;

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
      .to(stub, {
        y: 90,
        rotation: 8,
        opacity: 0,
        duration: 0.45,
        ease: "power2.in",
      })
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
        // The mascot kick enhances the reveal, but must never gate the hero.
        const fallback = window.setTimeout(startIntro, HERO_INTRO_FALLBACK_MS);

        // The mascot conducts these zones when it walks under them
        const onMascotZone = (event: Event) => {
          const zone = (event as CustomEvent).detail?.zone;
          if (zone === "card-stub") {
            // The punch lands on the card's right edge: one continuous
            // impulse — shoved sideways while whirling like a placard hit
            // by a fist (3 turns, expo decay = hard strike + friction, no
            // eased-tween seams), drifting past front, settling elastically,
            // all while rocking on its hanging axis. The barcode scan only
            // resumes once the card has stopped spinning.
            gsap
              .timeline()
              // impact shove + spin impulse land on the same frame
              .to(".hero-card-wrap", {
                x: -16,
                duration: 0.09,
                ease: "power3.out",
                overwrite: "auto",
              })
              .to(
                ".hero-card-wrap",
                {
                  x: 0,
                  duration: CARD_PUNCH_X_SETTLE_MS / 1000,
                  ease: "elastic.out(1, 0.32)",
                },
                0.09,
              )
              .to(
                ".hero-card-wrap",
                {
                  transformPerspective: 1600,
                  rotationY: 1046,
                  duration: CARD_PUNCH_ROTATION_MS / 1000,
                  ease: "expo.out",
                },
                0,
              )
              // momentum carries it just past front...
              .to(".hero-card-wrap", {
                rotationY: 1088,
                duration: 0.45,
                ease: "power1.inOut",
              })
              // ...and it swings back to rest (1080° ≡ facing front)
              .to(".hero-card-wrap", {
                rotationY: 1080,
                duration: 1.0,
                ease: "elastic.out(1, 0.25)",
              })
              .set(".hero-card-wrap", {
                rotationY: 0,
                clearProps: "transformPerspective",
              });
            // Hanging-axis rock, decaying alongside the spin
            gsap
              .timeline({ delay: 0.09 })
              .to(".hero-card-wrap", {
                rotation: 1.3,
                transformOrigin: "top center",
                duration: 0.38,
                ease: "sine.inOut",
              })
              .to(".hero-card-wrap", {
                rotation: -0.9,
                duration: 0.42,
                ease: "sine.inOut",
              })
              .to(".hero-card-wrap", {
                rotation: 0.5,
                duration: 0.46,
                ease: "sine.inOut",
              })
              .to(".hero-card-wrap", {
                rotation: 0,
                duration: 0.6,
                ease: "sine.out",
              });
            // Boarding resumes after the whirl dies down
            const stub = sectionRef.current?.querySelector(".hero-stub");
            if (stub) {
              gsap.fromTo(
                ".hero-stub-sweep",
                { x: 0 },
                {
                  x: stub.clientWidth + 160,
                  duration: 0.9,
                  ease: "power2.inOut",
                  delay: 2.5,
                },
              );
            }
            gsap.fromTo(
              ".hero-dot",
              { scale: 1 },
              { scale: 2, duration: 0.14, yoyo: true, repeat: 5, delay: 2.5 },
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
              {
                backgroundColor: "rgba(202,255,67,0)",
                color: "rgba(17,17,17,0.35)",
              },
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
            // Snap! — the titles get highlighted like marker strokes
            gsap.fromTo(
              ".row-title",
              { backgroundColor: "rgba(202,255,67,0)" },
              {
                backgroundColor: "#CAFF43",
                duration: 0.3,
                stagger: { each: 0.16, from: "end" },
                yoyo: true,
                repeat: 1,
                repeatDelay: 0.5,
                clearProps: "backgroundColor",
              },
            );
          } else if (zone === "cv-artifact") {
            // Scanner pass: warm glow while the yellow band travels down
            // the page, tracking the mascot riding down the CV's edge
            gsap
              .timeline()
              .to(".hero-artifact-wrap", {
                scale: 1.04,
                filter: "drop-shadow(0 0 30px rgba(255,214,70,0.55))",
                duration: 0.35,
                ease: "power2.out",
                overwrite: "auto",
              })
              .fromTo(
                ".hero-artifact-scan",
                // matched to the real beam geometry: the beam's center
                // sweeps rect.top+22 → rect.bottom-18 while the mascot
                // rides down, so the band tracks -4% → 88%
                { top: "-4%", opacity: 0 },
                { opacity: 1, duration: 0.25 },
                "<",
              )
              .to(
                ".hero-artifact-scan",
                { top: "88%", duration: 1.9, ease: "sine.inOut" },
                "<",
              )
              .to(
                ".hero-artifact-scan",
                { opacity: 0, duration: 0.3 },
                ">-0.15",
              )
              .to(
                ".hero-artifact-wrap",
                {
                  scale: 1,
                  filter: "drop-shadow(0 0 0px rgba(255,214,70,0))",
                  duration: 0.6,
                  ease: "power2.inOut",
                  clearProps: "filter",
                },
                ">-0.1",
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
    <section
      id="hero"
      ref={sectionRef}
      className="snap-section relative bg-[#F5F2D8]"
    >
      <div className="flex-1 flex flex-col justify-start gap-4 px-4 pt-5 md:px-8 md:pt-6">
        {/* Editorial band above the card: stacked meta (left) +
            typographic manifesto (right) */}
        <div className="hero-fade hidden items-end justify-between gap-8 md:flex">
          {/* Same typographic recipe as the "Why it works" rows: tiny
              kicker on top, big display line underneath */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#141414]/40">
              AI Career Platform
            </span>
            <span className="font-display text-2xl font-extrabold leading-none tracking-tight text-[#141414] 2xl:text-3xl">
              Score · Fix · Match
            </span>
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
                      "Results in ~20s",
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
                        href="/app"
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
                  <span className="hidden sm:inline">Seat 01-A</span>
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
            <div
              data-mascot-zone="hero-rows"
              className="w-full max-w-[340px] 2xl:max-w-[420px]"
            >
              <p className="hero-fade mb-2 flex items-center justify-end gap-2.5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#141414]/40">
                Why it works
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
                    <span className="row-title rounded-md px-1.5 font-display text-3xl font-extrabold leading-none tracking-tight text-[#141414] transition-transform duration-300 group-hover:-translate-x-1 2xl:text-4xl">
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
          <div
            data-mascot-zone="cv-artifact"
            className="pointer-events-none absolute left-[62%] top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 scale-105 lg:block xl:left-[760px] xl:scale-[1.18]"
          >
            <div className="hero-artifact-wrap pointer-events-auto relative">
              <HeroCvArtifact />
              {/* Scanner band — travels top→bottom in sync with the mascot
                  riding down the CV's edge with its flashlight */}
              <div
                aria-hidden="true"
                className="hero-artifact-scan pointer-events-none absolute inset-x-0 top-0 h-14 opacity-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent, rgba(255,220,90,0.5), rgba(255,232,130,0.35), transparent)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
