"use client";

import { ReactNode, useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap-loader";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: no-preference)";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: boolean;
  y?: number;
  duration?: number;
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  stagger = false,
  y = 32,
  duration = 0.9,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    let mm: { revert: () => void } | null = null;
    loadGsap().then(({ gsap }) => {
      if (!el) {
        return;
      }
      const media = gsap.matchMedia(el);
      mm = media;
      media.add(REDUCED_MOTION_QUERY, () => {
        if (stagger) {
          const items = el.children;
          gsap.fromTo(
            items,
            { opacity: 0, y },
            {
              opacity: 1,
              y: 0,
              duration,
              ease: "power3.out",
              stagger: 0.1,
              delay,
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                once: true,
              },
            },
          );
        } else {
          gsap.fromTo(
            el,
            { opacity: 0, y },
            {
              opacity: 1,
              y: 0,
              duration,
              ease: "power3.out",
              delay,
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                once: true,
              },
            },
          );
        }
      });
    });
    return () => {
      mm?.revert();
    };
  }, [delay, stagger, y, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
