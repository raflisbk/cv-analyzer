import { useEffect } from "react";
import type { RefObject } from "react";
import { loadGsap } from "@/lib/gsap-loader";

export function useHeroLines(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const stage = ref.current;
    if (!stage) {
      return;
    }
    let cancelled = false;
    let animation: { kill: () => void } | undefined;
    const draw = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }
      void loadGsap().then(({ gsap }) => {
        if (cancelled) {
          return;
        }
        animation = gsap.fromTo(
          stage.querySelectorAll("[data-leader-line]"),
          { scaleX: 0 },
          { scaleX: 1, stagger: 0.15, duration: 0.25, ease: "power2.out" },
        );
      });
    };
    const loader = document.querySelector<HTMLElement>("[data-landing-loader]");
    if (!loader || loader.style.display === "none") {
      draw();
    } else {
      window.addEventListener("landing-intro-complete", draw, { once: true });
    }
    return () => {
      cancelled = true;
      window.removeEventListener("landing-intro-complete", draw);
      animation?.kill();
    };
  }, [ref]);
}
