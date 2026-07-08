"use client";

import { useEffect, useRef, useState } from "react";
import { loadGsap, type GsapCtx } from "@/lib/gsap-loader";
import { PathkrInline } from "@/components/ui/pathkr-logo";
import {
  PenEditIcon,
  MetricIcon,
  TargetIcon,
  CheckShieldIcon,
  ChatBubbleIcon,
} from "@/components/ui/feature-icons";

const beforeItems = [
  { label: "Score", value: "42/100", color: "#F43F5E", bar: 42 },
  { label: "Impact", value: "38", color: "#F43F5E", bar: 38 },
  { label: "Clarity", value: "45", color: "#F43F5E", bar: 45 },
  { label: "Grammar", value: "7 issues", color: "#F43F5E", bar: 30 },
  { label: "ATS", value: "4/10", color: "#F43F5E", bar: 40 },
  { label: "Skills matched", value: "3/12", color: "#F43F5E", bar: 25 },
];

const afterItems = [
  { label: "Score", value: "78/100", color: "#CAFF43", bar: 78 },
  { label: "Impact", value: "82", color: "#CAFF43", bar: 82 },
  { label: "Clarity", value: "75", color: "#CAFF43", bar: 75 },
  { label: "Grammar", value: "0 issues", color: "#CAFF43", bar: 100 },
  { label: "ATS", value: "9/10", color: "#CAFF43", bar: 90 },
  { label: "Skills matched", value: "10/12", color: "#CAFF43", bar: 83 },
];

const improvements = [
  { Icon: PenEditIcon, text: "Fixed 7 grammar & spelling errors" },
  { Icon: MetricIcon, text: "Added quantified metrics to 4 bullets" },
  { Icon: TargetIcon, text: "Rewrote summary with achievements" },
  { Icon: CheckShieldIcon, text: "Passed ATS — added missing keywords" },
  { Icon: ChatBubbleIcon, text: "Chat AI refined experience section" },
];

function MetricRow({
  item,
  animate,
  delay,
}: {
  item: (typeof beforeItems)[0];
  animate: boolean;
  delay: number;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!animate) {
      return;
    }
    const timer = setTimeout(() => setWidth(item.bar), delay);
    return () => clearTimeout(timer);
  }, [animate, item.bar, delay]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-mono text-[#F5F2D8]/40 w-24 shrink-0">
        {item.label}
      </span>
      <div
        className="flex-1 h-2 rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="h-2 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${animate ? width : 0}%`, background: item.color }}
        />
      </div>
      <span
        className="text-[11px] font-mono font-bold w-16 text-right shrink-0"
        style={{ color: item.color }}
      >
        {item.value}
      </span>
    </div>
  );
}

export default function SeeItInActionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const ctxRef = useRef<GsapCtx | null>(null);
  const [showAfter, setShowAfter] = useState(false);
  const [showImprovements, setShowImprovements] = useState(false);

  const items = showAfter ? afterItems : beforeItems;

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }
    let ctx: GsapCtx | null = null;
    loadGsap().then(({ gsap }) => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          ".sia-heading",
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".sia-heading",
              start: "top 85%",
              once: true,
            },
          }
        );

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".sia-cards",
            start: "top 85%",
            once: true,
            onEnter: () => {
              setTimeout(() => setShowAfter(true), 1500);
              setTimeout(() => setShowImprovements(true), 2800);
            },
          },
        });

        tl.fromTo(
          ".sia-before",
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" }
        ).fromTo(
          ".sia-after",
          { opacity: 0, x: 40 },
          { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" },
          "-=0.5"
        );
      }, sectionRef);
      ctxRef.current = ctx;
    });
    return () => {
      ctx?.revert();
    };
  }, []);

  useEffect(() => {
    if (!showImprovements) {
      return;
    }
    let ctx: GsapCtx | null = null;
    loadGsap().then(({ gsap }) => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          ".improvement-item",
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power3.out",
            stagger: 0.08,
          }
        );
      });
    });
    return () => {
      ctx?.revert();
    };
  }, [showImprovements]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="sia-heading"
      className="snap-section bg-[#F5F2D8]"
    >
      <div className="flex-1 flex items-center overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-8 w-full">
          <div className="sia-heading mb-8 text-center">
            <h2
              id="sia-heading"
              className="mb-4 font-display text-3xl md:text-4xl font-extrabold tracking-tight text-[#141414]"
            >
              Before & after <span className="gradient-text-lime"><PathkrInline /></span>
            </h2>
            <p className="mx-auto max-w-lg text-base font-medium tracking-wide text-[#141414]/50">
              Real results from real CVs — see the difference AI makes.
            </p>
          </div>

          <div className="sia-cards grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before card */}
            <div
              className="sia-before rounded-2xl overflow-hidden p-6 md:p-8"
              style={{
                background: "#1A170F",
                border: "1px solid rgba(244,63,94,0.15)",
                boxShadow:
                  "0 12px 48px rgba(0,0,0,0.2), 0 0 30px rgba(244,63,94,0.05)",
              }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="h-2 w-2 rounded-full bg-[#F43F5E]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#F43F5E]/70">
                  Before
                </span>
              </div>

              <div className="space-y-3.5">
                {beforeItems.map((item) => (
                  <MetricRow key={item.label} item={item} animate={true} delay={200} />
                ))}
              </div>

              <div
                className="mt-6 rounded-lg px-3 py-2.5"
                style={{
                  background: "rgba(244,63,94,0.06)",
                  border: "1px solid rgba(244,63,94,0.12)",
                }}
              >
                <p className="text-[10px] font-mono text-[#F43F5E]/60">
                  CV fails ATS screening · No quantified achievements · Passive
                  voice throughout
                </p>
              </div>
            </div>

            {/* After card */}
            <div
              className="sia-after rounded-2xl overflow-hidden p-6 md:p-8 transition-all duration-500"
              style={{
                background: "#1A170F",
                border: showAfter
                  ? "1px solid rgba(202,255,67,0.2)"
                  : "1px solid rgba(255,255,255,0.08)",
                boxShadow: showAfter
                  ? "0 12px 48px rgba(0,0,0,0.2), 0 0 40px rgba(202,255,67,0.08)"
                  : "0 12px 48px rgba(0,0,0,0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div
                  className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                    showAfter ? "bg-[#CAFF43]" : "bg-[#F5F2D8]/20"
                  }`}
                />
                <span
                  className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                    showAfter ? "text-[#CAFF43]/80" : "text-[#F5F2D8]/30"
                  }`}
                >
                  After
                </span>
                {showAfter && (
                  <span className="ml-auto rounded-full px-2.5 py-1 text-[9px] font-bold bg-[#CAFF43]/15 text-[#CAFF43] border border-[#CAFF43]/20">
                    +36 pts
                  </span>
                )}
              </div>

              <div className="space-y-3.5">
                {items.map((item) => (
                  <MetricRow
                    key={item.label}
                    item={item}
                    animate={true}
                    delay={showAfter ? 300 : 200}
                  />
                ))}
              </div>

              <div
                className="mt-6 rounded-lg px-3 py-2.5 transition-all duration-500"
                style={{
                  background: showAfter
                    ? "rgba(202,255,67,0.06)"
                    : "rgba(255,255,255,0.02)",
                  border: showAfter
                    ? "1px solid rgba(202,255,67,0.12)"
                    : "1px solid rgba(255,255,255,0.04)",
                }}
              >
                {showAfter ? (
                  <p className="text-[10px] font-mono text-[#CAFF43]/60">
                    ATS passed · Quantified bullets · Active voice · 10/12 skills
                    matched
                  </p>
                ) : (
                  <p className="text-[10px] font-mono text-[#F5F2D8]/20">
                    Analyzing...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Improvement list */}
          {showImprovements && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-3">
              {improvements.map((imp) => (
                <div
                  key={imp.text}
                  className="improvement-item flex items-center gap-2 rounded-xl px-4 py-3"
                  style={{
                    background: "rgba(202,255,67,0.04)",
                    border: "1px solid rgba(202,255,67,0.08)",
                  }}
                >
                  <imp.Icon size={14} className="text-[#141414]/50 shrink-0" />
                  <span className="text-[12px] font-medium text-[#141414]/60">
                    {imp.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
