import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap-loader";

type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];
type Timeline = ReturnType<Gsap["timeline"]>;

function defaultEnd(panel: HTMLElement) {
  return panel.offsetHeight > window.innerHeight * 0.85
    ? "bottom 60%"
    : "top 28%";
}

export function useLandingStory(
  build: (gsap: Gsap, panel: HTMLElement, timeline: Timeline) => void,
  length = 110,
  prepare?: (panel: HTMLElement) => void,
  scrollThrough?: { start: string; end: string },
) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const panel = ref.current;
    if (!panel || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    let cancelled = false;
    let timeline: Timeline | undefined;
    const start = async () => {
      await Promise.all([
        document.fonts.ready,
        ...Array.from(panel.querySelectorAll("img")).map((img) =>
          img.decode().catch(() => undefined),
        ),
      ]);
      try {
        const { gsap, ScrollTrigger } = await loadGsap();
        if (cancelled) return;
        prepare?.(panel);
        const pin =
          !scrollThrough && panel.offsetHeight <= window.innerHeight + 30;
        timeline = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: panel,
            start: pin ? "top 12px" : (scrollThrough?.start ?? "top 92%"),
            end: pin
              ? `+=${length}%`
              : (scrollThrough?.end ?? defaultEnd(panel)),
            pin,
            scrub: 0.6,
            anticipatePin: 1,
          },
        });
        if (!pin && !scrollThrough)
          timeline.from(
            panel,
            { y: 64, scale: 0.95, duration: 0.35, ease: "power2.out" },
            0,
          );
        build(gsap, panel, timeline);
        timeline.to({}, { duration: 0.3 });
        ScrollTrigger.refresh();
      } catch {
        timeline?.kill();
      }
    };
    if (
      document.querySelector<HTMLElement>("[data-landing-loader]")?.style
        .display === "none"
    )
      void start();
    else
      window.addEventListener("landing-intro-complete", start, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("landing-intro-complete", start);
      timeline?.kill();
    };
  }, [build, length, prepare, scrollThrough]);
  return ref;
}
