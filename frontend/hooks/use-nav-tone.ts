import { useEffect } from "react";
import type { RefObject } from "react";

const SAMPLE_LINE = 60;

export function useNavTone(headerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const header = headerRef.current;
    const sections = document.querySelectorAll<HTMLElement>("[data-nav-tone]");
    if (!header || sections.length === 0) return;
    let observer: IntersectionObserver | undefined;
    const connect = () => {
      observer?.disconnect();
      const below = Math.max(0, window.innerHeight - SAMPLE_LINE - 1);
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const tone = (entry.target as HTMLElement).dataset.navTone;
            if (entry.isIntersecting && tone) header.dataset.tone = tone;
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
