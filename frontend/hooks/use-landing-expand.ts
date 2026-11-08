import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap-loader";
import {
  expandProgress,
  panelPaddingExtra,
  panelRadius,
  panelWidth,
  type ExpandMode,
} from "@/lib/landing-expand";

export function useLandingExpand(mode: ExpandMode) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const panel = ref.current;
    if (
      !panel ||
      window.innerWidth <= 860 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let cancelled = false;
    let trigger: { kill: () => void } | undefined;
    const original = panel.getAttribute("style");
    const basePadding = parseFloat(getComputedStyle(panel).paddingLeft);

    const paint = () => {
      const wrapper = panel.parentElement?.classList.contains("pin-spacer")
        ? panel.parentElement
        : panel;
      const rect = wrapper.getBoundingClientRect();
      const progress = expandProgress(
        { top: rect.top, bottom: rect.bottom, viewport: window.innerHeight },
        mode,
      );
      const width =
        mode === "sheet"
          ? window.innerWidth
          : panelWidth(progress, window.innerWidth);
      const radius =
        mode === "sheet" ? 56 * (1 - progress) : panelRadius(progress);
      const padding = basePadding + panelPaddingExtra(width);
      panel.style.maxWidth = `${width}px`;
      panel.style.borderRadius =
        mode === "sheet" ? `${radius}px ${radius}px 0 0` : `${radius}px`;
      panel.style.paddingInline = `${padding}px`;
      if (mode === "sheet") panel.style.marginBottom = "0";
    };

    const start = async () => {
      await Promise.all([
        document.fonts.ready,
        ...Array.from(panel.querySelectorAll("img")).map((img) =>
          img.decode().catch(() => undefined),
        ),
      ]);
      const { ScrollTrigger } = await loadGsap();
      if (cancelled) return;
      trigger = ScrollTrigger.create({
        trigger: panel,
        start: "top bottom",
        end: "bottom top",
        onUpdate: paint,
        onRefresh: paint,
        invalidateOnRefresh: true,
      });
      paint();
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
      trigger?.kill();
      if (original === null) panel.removeAttribute("style");
      else panel.setAttribute("style", original);
    };
  }, [mode]);

  return ref;
}
