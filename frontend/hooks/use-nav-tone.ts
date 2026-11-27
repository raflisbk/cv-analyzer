import { useEffect } from "react";
import type { RefObject } from "react";

const SAMPLE_LINE = 60;
const BAND = 20;

export function useNavTone(headerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const header = headerRef.current;
    const sections = document.querySelectorAll<HTMLElement>("[data-nav-tone]");
    if (!header || sections.length === 0) return;
    const order = Array.from(sections);
    const inBand = new Set<Element>();
    let observer: IntersectionObserver | undefined;
    const connect = () => {
      observer?.disconnect();
      inBand.clear();
      const below = Math.max(0, window.innerHeight - SAMPLE_LINE - BAND);
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) inBand.add(entry.target);
            else inBand.delete(entry.target);
          }
          const current = order.filter((section) => inBand.has(section)).pop();
          if (current?.dataset.navTone) {
            header.dataset.tone = current.dataset.navTone;
          }
        },
        { rootMargin: `-${SAMPLE_LINE}px 0px -${below}px 0px` },
      );
      sections.forEach((section) => observer!.observe(section));
    };
    connect();
    window.addEventListener("resize", connect);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", connect);
    };
  }, [headerRef]);
}
