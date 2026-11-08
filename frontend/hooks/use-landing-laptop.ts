import { useEffect, type RefObject } from "react";
import { loadGsap } from "@/lib/gsap-loader";
import { paintLaptop } from "@/components/landing/motion/laptop";

async function createLaptopTrigger(
  panel: HTMLElement,
  canvas: HTMLCanvasElement,
  isCancelled: () => boolean,
  setTrigger: (trigger: { kill: () => void }) => void,
) {
  await document.fonts.ready;
  if (canvas.dataset.framesReady !== "true") {
    await new Promise<void>((resolve) =>
      canvas.addEventListener("laptop-frames-ready", () => resolve(), {
        once: true,
      }),
    );
  }
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
    const canvas = panel.querySelector<HTMLCanvasElement>("canvas");
    if (!canvas) {
      return;
    }
    let cancelled = false;
    let trigger: { kill: () => void } | undefined;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      paintLaptop(panel, 1, true);
      return;
    }
    const start = () =>
      void createLaptopTrigger(
        panel,
        canvas,
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
