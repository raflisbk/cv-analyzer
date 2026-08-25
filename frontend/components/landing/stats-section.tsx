"use client";

import { useEffect, useRef } from "react";
import {
  BarChart3,
  Bot,
  CheckCircle,
  MessageSquare,
  Target,
} from "lucide-react";
import { loadGsap } from "@/lib/gsap-loader";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: no-preference)";

const stats = [
  { number: "1,088", label: "Role Archetypes", isLime: false },
  { number: "4", label: "Scoring Dimensions", isLime: true },
  { number: "Free", label: "To Use", isLime: false },
  { number: "~20s", label: "Analysis Time", isLime: false },
];

const orbitPositions = [
  { Icon: Bot, x: 80, y: 0, label: "AI" },
  { Icon: BarChart3, x: 24.72, y: -75.98, label: "Scoring" },
  { Icon: CheckCircle, x: -64.72, y: -47.02, label: "ATS" },
  { Icon: MessageSquare, x: -64.72, y: 47.02, label: "Chat" },
  { Icon: Target, x: 24.72, y: 75.98, label: "Match" },
];

function OrbitGraphic() {
  return (
    <div className="relative w-40 h-40 mx-auto mb-8">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: "1px solid rgba(202,255,67,0.12)",
          background:
            "radial-gradient(circle, rgba(202,255,67,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        className="orbit-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl flex items-center justify-center font-display text-lg font-extrabold text-[#141414]"
        style={{ background: "#CAFF43" }}
      >
        PK
      </div>
      {orbitPositions.map(({ Icon, x, y, label }) => (
        <div
          key={label}
          className="orbit-icon absolute top-1/2 left-1/2 w-9 h-9 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-sm"
          style={{
            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
          aria-label={label}
        >
          <Icon size={16} aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}

function AnimatedCounter({
  target,
  isLime,
}: {
  target: string;
  isLime: boolean;
}) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) {
      return;
    }
    const numericMatch = target.match(/[\d,]+/);
    if (!numericMatch) {
      return;
    }
    const numericStr = numericMatch[0].replace(/,/g, "");
    const numericVal = parseInt(numericStr, 10);
    if (isNaN(numericVal)) {
      return;
    }
    const prefix = target.slice(0, target.indexOf(numericMatch[0]));
    const suffix = target.slice(
      target.indexOf(numericMatch[0]) + numericMatch[0].length,
    );

    let reverted = false;
    let mm: { revert: () => void } | null = null;
    const obj = { val: 0 };
    loadGsap().then(({ gsap }) => {
      if (reverted) {
        return;
      }
      const media = gsap.matchMedia(el);
      mm = media;
      media.add(REDUCED_MOTION_QUERY, () => {
        gsap.to(obj, {
          val: numericVal,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
          onUpdate: () => {
            const formatted =
              obj.val >= 1000 ? obj.val.toLocaleString() : String(obj.val);
            el.textContent = prefix + formatted + suffix;
          },
        });
      });
    });
    return () => {
      reverted = true;
      mm?.revert();
    };
  }, [target]);

  return (
    <span
      ref={spanRef}
      className={`font-display font-extrabold text-4xl md:text-5xl leading-none tracking-tight ${
        isLime ? "text-[#CAFF43]" : "text-[#F5F2D8]"
      }`}
      style={
        isLime ? { textShadow: "0 0 20px rgba(202,255,67,0.2)" } : undefined
      }
    >
      {target}
    </span>
  );
}

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }
    let mm: { revert: () => void } | null = null;
    loadGsap().then(({ gsap }) => {
      const media = gsap.matchMedia(sectionRef);
      mm = media;
      media.add(REDUCED_MOTION_QUERY, () => {
        gsap.fromTo(
          ".orbit-center",
          { scale: 0.5, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger: ".orbit-center",
              start: "top 85%",
              once: true,
            },
          },
        );

        gsap.fromTo(
          ".orbit-icon",
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            ease: "back.out(1.4)",
            stagger: 0.1,
            scrollTrigger: {
              trigger: ".orbit-icon",
              start: "top 85%",
              once: true,
            },
          },
        );

        gsap.fromTo(
          ".stat-item",
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: ".stat-item",
              start: "top 85%",
              once: true,
            },
          },
        );
      });
    });
    return () => {
      mm?.revert();
    };
  }, []);

  return (
    <section
      id="stats"
      ref={sectionRef}
      className="snap-section"
      style={{
        background: "linear-gradient(180deg, #1A170F 0%, #16130C 100%)",
      }}
    >
      <div className="flex-1 flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full py-8">
          <OrbitGraphic />

          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-0">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="stat-item group flex items-center"
              >
                <div className="text-center px-8 transition-transform duration-300 group-hover:-translate-y-1">
                  <AnimatedCounter target={stat.number} isLime={stat.isLime} />
                  <p className="text-[15px] font-medium tracking-wide text-[#F5F2D8]/50 uppercase">
                    {stat.label}
                  </p>
                </div>

                {i < stats.length - 1 && (
                  <div
                    className="hidden md:block w-px h-16 mx-0 bg-gradient-to-b from-transparent via-[#F5F2D8]/10 to-transparent"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
