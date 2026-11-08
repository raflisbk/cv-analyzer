import { useEffect, useRef } from "react";
import { heroChromeHeight } from "@/lib/landing-hero-layout";

export function useHeroChrome() {
  const announcementRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const announcement = announcementRef.current;
    const header = document.querySelector<HTMLElement>("[data-landing-nav]");
    const hero = heroRef.current;
    if (!announcement || !header || !hero) {
      return;
    }
    const updateHeight = () => {
      hero.style.setProperty(
        "--hero-chrome",
        heroChromeHeight(announcement.offsetHeight, header.offsetHeight),
      );
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(announcement);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return { announcementRef, heroRef };
}
