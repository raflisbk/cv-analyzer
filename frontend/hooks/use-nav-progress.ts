import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import {
  barOffset,
  barProgress,
} from "@/components/landing/navbar/nav-progress";

export function useNavProgress(
  spacerRef: RefObject<HTMLElement | null>,
  headerRef: RefObject<HTMLElement | null>,
) {
  const frame = useRef(0);
  useEffect(() => {
    const spacer = spacerRef.current;
    const header = headerRef.current;
    if (!spacer || !header) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let pageTop = spacer.getBoundingClientRect().top + window.scrollY;
    const paint = () => {
      frame.current = 0;
      const scrollY = window.scrollY;
      header.style.setProperty(
        "--bar-p",
        String(barProgress(scrollY, reduced.matches)),
      );
      header.style.setProperty("--bar-y", `${barOffset(pageTop, scrollY)}px`);
    };
    const schedule = () => {
      if (!frame.current) frame.current = requestAnimationFrame(paint);
    };
    const measure = () => {
      pageTop = spacer.getBoundingClientRect().top + window.scrollY;
      schedule();
    };
    paint();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
    };
  }, [spacerRef, headerRef]);
}
