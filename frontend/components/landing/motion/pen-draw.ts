import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap-loader";

export function penShouldDraw(play: boolean, reducedMotion: boolean) {
  return play && !reducedMotion;
}

export function penTriggerReady(introComplete: boolean, loaderHidden: boolean) {
  return introComplete || loaderHidden;
}

function showFinalStroke(svg: SVGSVGElement) {
  svg.querySelectorAll("path").forEach((path) => {
    path.style.strokeDashoffset = "0";
  });
}

function watchPen(svg: SVGSVGElement, draw: () => void) {
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) {
        return;
      }
      observer.disconnect();
      draw();
    },
    { threshold: 0.1 },
  );
  observer.observe(svg.closest("section") ?? svg);
  return observer;
}

function animatePen(
  svg: SVGSVGElement,
  delay: number,
  cancelled: () => boolean,
  keep: (animation: { kill: () => void }) => void,
) {
  void loadGsap()
    .then(({ gsap }) => {
      if (cancelled()) {
        return;
      }
      keep(
        gsap.to(svg.querySelectorAll("path"), {
          strokeDashoffset: 0,
          duration: 0.65,
          delay,
          ease: "power2.out",
        }),
      );
    })
    .catch(() => showFinalStroke(svg));
}

function waitForPenTrigger(svg: SVGSVGElement, draw: () => void) {
  let observer: IntersectionObserver | undefined;
  const watch = () => {
    observer = watchPen(svg, draw);
  };
  const loader = document.querySelector<HTMLElement>("[data-landing-loader]");
  if (penTriggerReady(!loader, loader?.style.display === "none")) {
    watch();
  } else {
    window.addEventListener("landing-intro-complete", watch, { once: true });
  }
  return () => {
    observer?.disconnect();
    window.removeEventListener("landing-intro-complete", watch);
  };
}

function preparePen(svg: SVGSVGElement) {
  svg.querySelectorAll("path").forEach((path) => {
    path.style.strokeDasharray = "1";
    path.style.strokeDashoffset = "1";
  });
}

function canAnimatePen(play: boolean) {
  return Boolean(
    play &&
    window.matchMedia &&
    "IntersectionObserver" in window &&
    penShouldDraw(
      play,
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
  );
}

export function usePenDraw(play = true, delay = 0) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg || !canAnimatePen(play)) {
      return;
    }
    preparePen(svg);
    let cancelled = false;
    let animation: { kill: () => void } | undefined;
    const stopWatching = waitForPenTrigger(svg, () =>
      animatePen(
        svg,
        delay,
        () => cancelled,
        (value) => {
          animation = value;
        },
      ),
    );
    return () => {
      cancelled = true;
      stopWatching();
      animation?.kill();
    };
  }, [play, delay]);
  return ref;
}
