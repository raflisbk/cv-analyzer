import { useCallback, useEffect, useRef } from "react";
import type { MouseEvent, RefObject } from "react";
import {
  easeInOutCubic,
  flightPath,
  scrollDuration,
} from "@/lib/landing-nav-scroll";
import type { FlightPath } from "@/lib/landing-nav-scroll";
import {
  bounceHeading,
  createFlight,
  paintFlight,
} from "@/components/landing/navbar/nav-flight-visuals";

type Flight = {
  frame: number;
  plane: HTMLImageElement;
  trail: SVGSVGElement;
  pressTimer: number;
  anchor: HTMLAnchorElement;
};

function runFlight(
  section: HTMLElement,
  anchor: HTMLAnchorElement,
  path: FlightPath,
  destination: number,
  active: RefObject<Flight | null>,
  stop: () => void,
) {
  const origin = window.scrollY;
  const { plane, trail, line } = createFlight();
  anchor.style.translate = "0 3px";
  const pressTimer = window.setTimeout(() => {
    anchor.style.translate = "";
  }, 160);
  const duration = scrollDuration(Math.abs(destination - origin));
  const started = performance.now();
  const frame = (now: number) => {
    const progress = Math.min(1, (now - started) / duration);
    window.scrollTo({
      top: origin + (destination - origin) * easeInOutCubic(progress),
      behavior: "instant",
    });
    paintFlight(path, progress, plane, line);
    if (progress < 1) active.current!.frame = requestAnimationFrame(frame);
    else {
      stop();
      bounceHeading(section);
    }
  };
  active.current = {
    frame: requestAnimationFrame(frame),
    plane,
    trail,
    pressTimer,
    anchor,
  };
}

function startFlight(
  section: HTMLElement,
  anchor: HTMLAnchorElement,
  active: RefObject<Flight | null>,
  stop: () => void,
) {
  const target = section.closest(".pin-spacer") ?? section;
  const destination = target.getBoundingClientRect().top + window.scrollY;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    target.scrollIntoView({ behavior: "instant" });
    return;
  }
  if (Math.abs(destination - window.scrollY) < 4) return;
  const bounds = anchor.getBoundingClientRect();
  const start = {
    x: bounds.left + bounds.width / 2,
    y: bounds.top + bounds.height / 2,
  };
  const path = flightPath(
    start,
    { x: window.innerWidth + 120, y: window.innerHeight * 0.18 },
    { width: window.innerWidth, height: window.innerHeight },
  );
  runFlight(section, anchor, path, destination, active, stop);
}

function useFlightInterrupts(stop: () => void) {
  useEffect(() => {
    const interrupt = () => stop();
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    window.addEventListener("keydown", interrupt);
    return () => {
      stop();
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchstart", interrupt);
      window.removeEventListener("keydown", interrupt);
    };
  }, [stop]);
}

export function useNavScroll() {
  const active = useRef<Flight | null>(null);
  const stop = useCallback(() => {
    if (!active.current) return;
    cancelAnimationFrame(active.current.frame);
    clearTimeout(active.current.pressTimer);
    active.current.anchor.style.translate = "";
    active.current.plane.remove();
    active.current.trail.remove();
    active.current = null;
  }, []);
  useFlightInterrupts(stop);
  return useCallback(
    (
      event: MouseEvent<HTMLAnchorElement>,
      sectionId: string,
      anchor: HTMLAnchorElement,
    ) => {
      const section =
        sectionId === "features"
          ? (document.getElementById("boxdemo") ??
            document.getElementById("features"))
          : document.getElementById(sectionId);
      if (!section) return;
      event.preventDefault();
      stop();
      startFlight(section, anchor, active, stop);
    },
    [stop],
  );
}
