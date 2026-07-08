"use client";

import { useEffect, useRef, ReactNode } from "react";
import { loadGsap, type GsapCtx } from "@/lib/gsap-loader";

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
  const ctxRef = useRef<GsapCtx | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    let ctx: GsapCtx | null = null;
    loadGsap().then(({ gsap }) => {
      if (!el) {
        return;
      }
      ctx = gsap.context(() => {
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
            }
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
            }
          );
        }
      }, el);
      ctxRef.current = ctx;
    });
    return () => {
      ctx?.revert();
    };
  }, [delay, stagger, y, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
