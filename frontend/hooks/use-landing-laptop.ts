import { useEffect, type RefObject } from "react";
import { loadGsap } from "@/lib/gsap-loader";
import { STATIC_PROGRESS } from "@/lib/landing-laptop";
import { paintLaptop } from "@/components/landing/motion/laptop";

async function createLaptopTrigger(
  panel: HTMLElement,
  isCancelled: () => boolean,
  setTrigger: (trigger: { kill: () => void }) => void,
) {
  await document.fonts.ready;
  const { ScrollTrigger } = await loadGsap();
  if (isCancelled()) {
    return;
  }
  const trigger = ScrollTrigger.create({
    trigger: panel,
    start: "top top",
    end: "+=1200%",
    pin: true,
    scrub: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    refreshPriority: -Array.from(document.querySelectorAll("section")).indexOf(
      panel,
    ),
    onUpdate: (self) => paintLaptop(panel, self.progress),
    onRefresh: (self) => paintLaptop(panel, self.progress),
  });
  setTrigger(trigger);
  paintLaptop(panel, 0);
  ScrollTrigger.refresh();
}

export function useLandingLaptop(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const panel = ref.current;
    if (!panel) {
      return;
    }
    let cancelled = false;
    let trigger: { kill: () => void } | undefined;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      paintLaptop(panel, STATIC_PROGRESS, true);
      return;
    }
    paintLaptop(panel, 0);
    const start = () =>
      void createLaptopTrigger(
        panel,
        () => cancelled,
        (value) => {
          trigger = value;
        },
      );
    if (
      document.querySelector<HTMLElement>("[data-landing-loader]")?.style
        .display === "none"
    ) {
      void start();
    } else {
      window.addEventListener("landing-intro-complete", start, { once: true });
    }
    return () => {
      cancelled = true;
      window.removeEventListener("landing-intro-complete", start);
      trigger?.kill();
    };
  }, [ref]);
}
