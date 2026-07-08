"use client";

import { useEffect, useRef, useState } from "react";
import { loadGsap, type GsapCtx } from "@/lib/gsap-loader";
import { AccentPill } from "@/components/ui/accent-pill";

const steps = [
  {
    pillColor: "lime" as const,
    number: "1",
    title: "Upload",
    description: "Drag and drop your CV or click to browse. Supports PDF and DOCX.",
    terminal: "$ pathkr analyze cv.pdf\nUploading document...",
  },
  {
    pillColor: "pink" as const,
    number: "2",
    title: "Analyze",
    description: "AI scores your CV across clarity, impact, ATS formatting, and keyword relevance.",
    terminal: "Analyzing...\n✓ Clarity: 78/100\n✓ Impact: 82/100\n✓ ATS: 9/10",
  },
  {
    pillColor: "orange" as const,
    number: "3",
    title: "Compare",
    description: "Paste any job description to get your match score and a ranked skill gap list.",
    terminal: "Comparing to JD...\nMatch: 85%\n+5 skills matched\n3 gaps identified",
  },
  {
    pillColor: "purple" as const,
    number: "4",
    title: "Export",
    description: "Download a professional PDF report with all scores, suggestions, and action items.",
    terminal: "Generating report...\n✓ PDF exported\n✓ 12 suggestions\nDone!",
  },
];

function TypewriterTerminal({ lines, started }: { lines: string[]; started: boolean }) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!started) {
      return;
    }
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 30);
    }, 30);
    return () => clearInterval(interval);
  }, [started]);

  useEffect(() => {
    if (!started || lines.length === 0) {
      return;
    }
    let acc = 0;
    const result: string[] = [];
    for (const line of lines) {
      acc += line.length * 12 + 200;
      if (elapsed >= acc) {
        result.push(line);
      } else {
        const partial = Math.floor((elapsed - (acc - line.length * 12 - 200)) / 12);
        if (partial > 0) {
          result.push(line.slice(0, partial));
        }
        break;
      }
    }
    setDisplayedLines(result);
  }, [elapsed, lines, started]);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "#0D0B08",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      <div
        className="flex items-center gap-1.5 px-4 py-2.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="h-2.5 w-2.5 rounded-full bg-[#F43F5E]/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-[#CAFF43]/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6]/60" />
        <span className="ml-2 text-[10px] font-mono text-[#F5F2D8]/20">pathkr terminal</span>
      </div>
      <div className="p-4 font-mono text-[12px] leading-relaxed min-h-[120px]">
        {displayedLines.map((line, i) => (
          <div key={i} className="text-[#CAFF43]/70">
            {line.startsWith("✓") ? (
              <span className="text-[#CAFF43]">{line}</span>
            ) : line.startsWith("+") ? (
              <span className="text-[#8B5CF6]">{line}</span>
            ) : line.startsWith("Match") ? (
              <span className="text-[#FF4FCB]">{line}</span>
            ) : (
              <span className="text-[#F5F2D8]/50">{line}</span>
            )}
          </div>
        ))}
        {started && <span className="inline-block w-2 h-3 bg-[#CAFF43]/70 animate-pulse" />}
      </div>
    </div>
  );
}

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const ctxRef = useRef<GsapCtx | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }
    let ctx: GsapCtx | null = null;
    loadGsap().then(({ gsap }) => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          ".hiws-heading",
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".hiws-heading",
              start: "top 85%",
              once: true,
            },
          }
        );

        gsap.fromTo(
          ".step-indicator",
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: ".step-indicator",
              start: "top 85%",
              once: true,
              onEnter: () => {
                setStarted(true);
              },
            },
          }
        );

        gsap.fromTo(
          ".terminal-block",
          { opacity: 0, y: 24, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".terminal-block",
              start: "top 85%",
              once: true,
            },
          }
        );
      }, sectionRef);
      ctxRef.current = ctx;
    });
    return () => {
      ctx?.revert();
    };
  }, []);

  useEffect(() => {
    if (!started) {
      return;
    }
    const timings = steps.map((step) => {
      let t = 0;
      for (const line of step.terminal.split("\n")) {
        t += line.length * 12 + 200;
      }
      return t;
    });
    let acc = 0;
    for (let i = 0; i < steps.length; i++) {
      const stepStart = acc;
      acc += timings[i];
      setTimeout(() => {
        setCurrentStep(i);
      }, stepStart);
    }
    return () => {
      setCurrentStep(0);
    };
  }, [started]);

  const currentLines = steps[currentStep]?.terminal.split("\n") ?? [];

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hiws-heading"
      className="snap-section bg-[#F5F2D8]"
    >
      <div className="flex-1 flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
          <h2
            id="hiws-heading"
            className="hiws-heading mb-10 text-center font-display text-3xl md:text-5xl font-extrabold tracking-tight text-[#141414]"
          >
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Step indicators */}
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div
                  key={step.number}
                  className={`step-indicator flex items-start gap-4 rounded-xl p-4 transition-all duration-300 ${
                    i === currentStep
                      ? "bg-[#141414]/[0.04] shadow-sm"
                      : "opacity-60"
                  }`}
                >
                  <AccentPill color={step.pillColor} size="sm">
                    Step {step.number}
                  </AccentPill>
                  <div>
                    <h3 className="font-display text-lg font-bold tracking-tight text-[#141414]">
                      {step.title}
                    </h3>
                    <p className="text-[14px] leading-relaxed text-[#141414]/60">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Terminal */}
            <div className="terminal-block">
              <TypewriterTerminal lines={currentLines} started={started} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
