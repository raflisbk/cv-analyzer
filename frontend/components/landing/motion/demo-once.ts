import { useEffect } from "react";
import type { RefObject } from "react";
import { loadGsap } from "@/lib/gsap-loader";
import { visibleOnce } from "./visible-once";

type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];

function animateBars(
  timeline: ReturnType<Gsap["timeline"]>,
  panel: HTMLElement,
) {
  const bars = panel.querySelectorAll<HTMLElement>("[data-demo-bar]");
  bars.forEach((bar, index) =>
    timeline.fromTo(
      bar,
      { width: "0%" },
      {
        width: `${bar.dataset.demoBar}%`,
        duration: 0.45,
        ease: "power2.out",
      },
      index * 0.08,
    ),
  );
}

function animateCounts(
  timeline: ReturnType<Gsap["timeline"]>,
  panel: HTMLElement,
) {
  panel.querySelectorAll<HTMLElement>("[data-demo-count]").forEach((number) => {
    const target = Number(number.dataset.demoCount);
    const value = { current: 0 };
    const ring =
      number.parentElement?.querySelector<SVGCircleElement>("[data-demo-ring]");
    timeline.fromTo(
      value,
      { current: 0 },
      {
        current: target,
        duration: 0.7,
        ease: "power2.out",
        onUpdate: () => {
          number.textContent = String(Math.round(value.current));
          if (ring) {
            ring.style.strokeDasharray = `${value.current * 2.64} 264`;
          }
        },
      },
      0,
    );
  });
}

function animateRequirements(
  timeline: ReturnType<Gsap["timeline"]>,
  panel: HTMLElement,
) {
  panel
    .querySelectorAll<HTMLElement>("[data-demo-requirement]")
    .forEach((chip, index) => {
      timeline.from(
        chip,
        { autoAlpha: 0, y: 8, duration: 0.2 },
        0.75 + index * 0.15,
      );
    });
}

function animateRewrites(
  timeline: ReturnType<Gsap["timeline"]>,
  panel: HTMLElement,
) {
  panel.querySelectorAll<HTMLElement>("[data-demo-before]").forEach((line) => {
    const path = line.querySelector("path");
    const svg = line.querySelector("[data-pen-mark='strike']");
    if (svg) {
      timeline.set(svg, { opacity: 1 }, 0.7);
    }
    if (path) {
      timeline.fromTo(
        path,
        { strokeDasharray: 1, strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          duration: 0.3,
        },
        0.7,
      );
    }
  });
  timeline.to(
    panel.querySelectorAll("[data-demo-after]"),
    {
      opacity: 1,
      stagger: 0.1,
      duration: 0.25,
    },
    1,
  );
}

function animateDemos(gsap: Gsap, panel: HTMLElement) {
  const timeline = gsap.timeline();
  animateBars(timeline, panel);
  animateCounts(timeline, panel);
  animateRequirements(timeline, panel);
  animateRewrites(timeline, panel);
  return timeline;
}

export function useDemoOnce(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const panel = ref.current;
    if (!panel) {
      return;
    }
    let cancelled = false;
    let animation: { kill: () => void } | undefined;
    const enter = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }
      void loadGsap().then(({ gsap }) => {
        if (!cancelled) {
          animation = animateDemos(gsap, panel);
        }
      });
    };
    const stop = visibleOnce(panel, enter);
    return () => {
      cancelled = true;
      stop();
      animation?.kill();
    };
  }, [ref]);
}
