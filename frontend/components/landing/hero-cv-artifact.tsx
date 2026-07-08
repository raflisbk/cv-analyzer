"use client";

import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap-loader";
import { Check, PenLine } from "lucide-react";

/* Mini CV document that "analyzes itself": scan sweep, grammar underline,
   ATS / JD chips stamping in, score counting up. Markup renders the final
   state so no-JS and reduced-motion users see the completed artifact. */
export default function HeroCvArtifact() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) {
      return;
    }
    let mm: { revert: () => void } | null = null;

    loadGsap().then(({ gsap }) => {
      if (!rootRef.current) {
        return;
      }
      const media = gsap.matchMedia(rootRef);
      mm = media;

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const scoreEl = rootRef.current?.querySelector(".cv-score-num");
        const counter = { value: 0 };

        const tl = gsap.timeline({ delay: 0.9 });

        tl.from(".cv-paper", {
          y: 36,
          rotate: 9,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
        })
          .fromTo(
            ".cv-scan",
            { top: "4%", opacity: 0 },
            { opacity: 0.9, duration: 0.2 },
            "-=0.2"
          )
          .to(".cv-scan", { top: "92%", duration: 1.2, ease: "power1.inOut" }, "<")
          .to(".cv-scan", { opacity: 0, duration: 0.25 }, "-=0.25")
          .from(
            ".cv-score",
            { scale: 0, rotate: -14, duration: 0.5, ease: "back.out(2)" },
            "-=0.5"
          )
          .to(
            counter,
            {
              value: 87,
              duration: 0.8,
              ease: "power2.out",
              onUpdate: () => {
                if (scoreEl) {
                  scoreEl.textContent = String(Math.round(counter.value));
                }
              },
            },
            "<"
          )
          .from(
            ".cv-underline",
            { scaleX: 0, transformOrigin: "0% 50%", duration: 0.45, ease: "power2.out" },
            "+=0.1"
          )
          .from(
            ".cv-chip-grammar",
            { scale: 0, y: 10, duration: 0.45, ease: "back.out(1.8)" },
            "-=0.15"
          )
          .from(
            ".cv-chip-ats",
            { scale: 0, rotate: 8, duration: 0.45, ease: "back.out(1.8)" },
            "+=0.15"
          )
          .from(
            ".cv-chip-jd",
            { scale: 0, y: 10, duration: 0.45, ease: "back.out(1.8)" },
            "+=0.1"
          );

        // Idle: gentle float once the story has played.
        gsap.to(".cv-paper", {
          y: -7,
          duration: 3.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 5.2,
        });

        // Periodic re-scan, starts after the main timeline is done.
        const scanLoop = gsap.timeline({ repeat: -1, repeatDelay: 4.5, delay: 6.5 });
        scanLoop
          .fromTo(".cv-scan", { top: "4%", opacity: 0 }, { opacity: 0.7, duration: 0.25 })
          .to(".cv-scan", { top: "92%", duration: 1.4, ease: "power1.inOut" }, "<")
          .to(".cv-scan", { opacity: 0, duration: 0.25 }, "-=0.25");
      });
    });

    return () => {
      mm?.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="relative flex justify-center">
      <div
        className="cv-paper relative w-[250px] 2xl:w-[290px] rotate-[2.5deg] rounded-xl bg-[#F5F2D8] p-5"
        style={{
          boxShadow:
            "0 24px 64px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
      >
        {/* Scan line sweeping inside the paper */}
        <div
          aria-hidden="true"
          className="cv-scan pointer-events-none absolute left-2 right-2 z-10 h-[3px] rounded-full opacity-0"
          style={{
            top: "4%",
            background:
              "linear-gradient(90deg, transparent, rgba(122,168,0,0.65), transparent)",
            boxShadow: "0 0 14px rgba(202,255,67,0.9)",
          }}
        />

        {/* Score badge */}
        <div
          className="cv-score absolute -right-4 -top-4 z-20 flex h-16 w-16 flex-col items-center justify-center rounded-full"
          style={{
            background: "#CAFF43",
            color: "#1a2900",
            boxShadow: "0 8px 24px rgba(202,255,67,0.35), 0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          <span className="cv-score-num font-display text-xl font-black leading-none">
            87
          </span>
          <span className="text-[8px] font-black uppercase tracking-[0.18em]">
            score
          </span>
        </div>

        {/* Paper header */}
        <p className="font-display text-base font-extrabold leading-tight text-[#141414]">
          Alya Pratama
        </p>
        <p className="mt-0.5 text-[10px] font-semibold text-[#141414]/50">
          Product Designer · Jakarta
        </p>
        <div className="mt-2 flex gap-1.5">
          <div className="h-1.5 w-16 rounded-full bg-[#141414]/10" />
          <div className="h-1.5 w-10 rounded-full bg-[#141414]/10" />
          <div className="h-1.5 w-12 rounded-full bg-[#141414]/10" />
        </div>

        {/* Experience */}
        <p className="mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-[#141414]/35">
          Experience
        </p>
        <div className="mt-2 space-y-2">
          <div className="h-1.5 w-full rounded-full bg-[#141414]/12" />
          <div>
            <div className="h-1.5 w-11/12 rounded-full bg-[#141414]/12" />
            <div
              aria-hidden="true"
              className="cv-underline mt-1 h-[3px] w-3/4"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 1.2px, #FF8C42 1.1px, transparent 1.6px)",
                backgroundSize: "5px 3px",
                backgroundRepeat: "repeat-x",
              }}
            />
          </div>
          <div className="h-1.5 w-4/5 rounded-full bg-[#141414]/12" />
        </div>

        {/* Skills */}
        <p className="mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-[#141414]/35">
          Skills
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["Figma", "Design Systems", "UX Research", "Prototyping"].map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-[#141414]/15 px-2 py-0.5 text-[9px] font-bold text-[#141414]/55"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Education */}
        <p className="mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-[#141414]/35">
          Education
        </p>
        <div className="mt-2 space-y-2 pb-1">
          <div className="h-1.5 w-10/12 rounded-full bg-[#141414]/12" />
          <div className="h-1.5 w-7/12 rounded-full bg-[#141414]/12" />
        </div>

        {/* Floating analysis chips */}
        <div
          className="cv-chip-grammar absolute -left-8 top-[47%] z-20 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black"
          style={{
            background: "#FF8C42",
            color: "#2b1500",
            boxShadow: "0 6px 18px rgba(255,140,66,0.35)",
          }}
        >
          <PenLine className="h-2.5 w-2.5" aria-hidden="true" />
          Grammar fix
        </div>

        <div
          className="cv-chip-ats absolute -left-6 bottom-16 z-20 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black"
          style={{
            background: "#1E1A12",
            color: "#CAFF43",
            border: "1px solid rgba(202,255,67,0.4)",
            boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
          }}
        >
          <Check className="h-2.5 w-2.5" aria-hidden="true" />
          ATS compliant
        </div>

        <div
          className="cv-chip-jd absolute -right-6 bottom-7 z-20 rounded-full px-2.5 py-1 text-[10px] font-black"
          style={{
            background: "#8B5CF6",
            color: "#F5F2D8",
            boxShadow: "0 6px 18px rgba(139,92,246,0.35)",
          }}
        >
          JD match 78%
        </div>
      </div>
    </div>
  );
}
