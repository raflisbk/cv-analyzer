"use client";

import { useEffect, useRef } from "react";
import { loadGsap, type GsapCtx } from "@/lib/gsap-loader";
import {
  AIScoringIcon,
  SkillGapIcon,
  JobMatchIcon,
} from "@/components/ui/feature-icons";

const features = [
  {
    Icon: AIScoringIcon,
    accent: "#CAFF43",
    iconColor: "text-[#141414]",
    title: "AI Scoring",
    description:
      "Get a multi-dimensional score across clarity, impact, completeness, and ATS compatibility.",
  },
  {
    Icon: SkillGapIcon,
    accent: "#FF4FCB",
    iconColor: "text-[#141414]",
    title: "Skill Gap Analysis",
    description:
      "Identify the exact skills missing for your target role and close the gap with targeted suggestions.",
  },
  {
    Icon: JobMatchIcon,
    accent: "#FF8C42",
    iconColor: "text-[#141414]",
    title: "Job Match Comparison",
    description:
      "Paste any job description to see your match percentage and the qualifications you need to highlight.",
  },
];

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const ctxRef = useRef<GsapCtx | null>(null);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }
    let ctx: GsapCtx | null = null;
    loadGsap().then(({ gsap }) => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          ".features-heading",
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".features-heading",
              start: "top 85%",
              once: true,
            },
          },
        );

        gsap.fromTo(
          ".feature-card",
          { opacity: 0, y: 40, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: ".feature-card",
              start: "top 85%",
              once: true,
            },
          },
        );
      }, sectionRef);
      ctxRef.current = ctx;
    });
    return () => {
      ctx?.revert();
    };
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      aria-labelledby="features-heading"
      className="snap-section bg-[#F5F2D8]"
    >
      <div className="flex-1 flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
          <div className="features-heading mb-10 text-center">
            <h2
              id="features-heading"
              className="mb-5 font-display text-3xl md:text-5xl font-extrabold tracking-tight text-[#141414]"
            >
              What CV Analyzer can do
            </h2>
            <p className="mx-auto max-w-2xl text-base md:text-lg font-medium tracking-wide text-[#141414]/60">
              AI-powered analysis across 4 dimensions — clarity, impact, ATS
              compatibility, and keyword relevance.
            </p>
            <div className="mx-auto mt-6 flex max-w-2xl items-center justify-between border-y border-dashed border-[#141414]/20 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#141414]/40">
              <span>BOARDING PASS</span>
              <span>Three checks · One clear path</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map(
              ({ Icon, accent, iconColor, title, description }, index) => (
                <div
                  key={title}
                  className="feature-card group relative overflow-hidden border-y border-dashed border-[#141414]/20 px-5 py-5 transition-transform duration-300 hover:-translate-y-1.5"
                  style={{
                    borderTopColor: accent,
                  }}
                >
                  <div className="mb-5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.25em] text-[#141414]/40">
                    <span>BOARDING PASS</span>
                    <span>{String(index + 1).padStart(2, "0")} / 03</span>
                  </div>

                  <div className="mb-5 inline-flex h-11 w-11 items-center justify-center border border-dashed border-[#141414]/25 transition-transform duration-300 group-hover:scale-110">
                    <Icon size={26} className={iconColor} />
                  </div>

                  <h3 className="mb-3 font-display text-xl font-bold tracking-tight text-[#141414]">
                    {title}
                  </h3>

                  <p className="text-[15px] leading-relaxed text-[#141414]/60">
                    {description}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
