import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap-loader";
import { playIntro } from "@/components/landing/intro/play-intro";
import { playHeroScroll } from "@/components/landing/intro/play-hero-scroll";

export function useLandingIntro() {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;
    let cancelled = false;
    let intro: ReturnType<typeof playIntro>;
    let scroll: ReturnType<typeof playHeroScroll>;
    const hide = () => {
      loader.style.display = "none";
      window.dispatchEvent(new Event("landing-intro-complete"));
    };
    const failsafe = window.setTimeout(hide, 5500);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hide();
      return () => window.clearTimeout(failsafe);
    }
    loadGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled) return;
        const hero = document.querySelector<HTMLElement>("[data-landing-hero]");
        if (!hero) {
          hide();
          return;
        }
        intro = playIntro(gsap, loader, () => {
          hide();
          Promise.all([
            document.fonts.ready,
            ...Array.from(hero.querySelectorAll("img")).map((img) =>
              img.decode().catch(() => undefined),
            ),
          ]).then(() => {
            if (!cancelled) {
              scroll = playHeroScroll(gsap, hero);
              ScrollTrigger.refresh();
            }
          });
        });
      })
      .catch(hide);
    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      intro?.kill();
      scroll?.kill();
    };
  }, []);

  return loaderRef;
}
