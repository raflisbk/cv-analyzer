import { useEffect, type RefObject } from "react";
import { startProcessIris } from "@/components/landing/motion/process";

export function useProcessIris(
  wrapperRef: RefObject<HTMLDivElement | null>,
  panelRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const panel = panelRef.current;
    if (!wrapper || !panel) {
      return;
    }
    let cancelled = false;
    let stop: (() => void) | undefined;
    const start = () => {
      void startProcessIris(wrapper, panel, () => cancelled).then((cleanup) => {
        if (cancelled) {
          cleanup();
        } else {
          stop = cleanup;
        }
      });
    };
    if (
      document.querySelector<HTMLElement>("[data-landing-loader]")?.style
        .display === "none"
    ) {
      start();
    } else {
      window.addEventListener("landing-intro-complete", start, { once: true });
    }
    return () => {
      cancelled = true;
      window.removeEventListener("landing-intro-complete", start);
      stop?.();
    };
  }, [wrapperRef, panelRef]);
}
