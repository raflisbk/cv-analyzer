import { useCallback, useEffect, useReducer, useRef } from "react";
import type { RefObject } from "react";
import { loadGsap } from "@/lib/gsap-loader";
import { scoreBars } from "@/lib/landing-report";
import {
  afterScore,
  beforeScore,
  scoreDemoReducer,
} from "@/lib/landing-score-demo";
import { visibleOnce } from "./visible-once";

type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];
type Timeline = ReturnType<Gsap["timeline"]>;
type Event = Parameters<typeof scoreDemoReducer>[1];

function setScore(card: HTMLElement, score: number, impact?: number) {
  const number = card.querySelector<HTMLElement>("[data-score-number]");
  const ring = card.querySelector<SVGCircleElement>("[data-ring]");
  const bar = card.querySelector<HTMLElement>("[data-score-impact]");
  if (number) {
    number.textContent = String(score);
  }
  if (ring) {
    ring.style.strokeDasharray = `${score * 3.4} 340`;
  }
  if (bar && impact !== undefined) {
    bar.style.width = `${impact}%`;
  }
}

function animateEntry(
  gsap: Gsap,
  card: HTMLElement,
  done: () => void,
): Timeline {
  const count = { value: 0 };
  const bars = card.querySelectorAll<HTMLElement>("[data-score-bar]");
  setScore(card, 0, 0);
  gsap.set(bars, { width: "0%" });
  return gsap
    .timeline({ onComplete: done })
    .to(count, {
      value: beforeScore,
      duration: 0.75,
      ease: "power2.out",
      onUpdate: () => setScore(card, Math.round(count.value)),
    })
    .to(
      bars,
      {
        width: (i: number) => `${scoreBars[i].before}%`,
        stagger: 0.08,
        duration: 0.55,
      },
      0,
    );
}

function animateAccept(
  gsap: Gsap,
  card: HTMLElement,
  dispatch: (event: Event) => void,
): Timeline {
  const path = card.querySelector("[data-score-strike] path");
  const count = { value: beforeScore, impact: scoreBars[0].before };
  gsap.set(path, { strokeDasharray: 1, strokeDashoffset: 1 });
  return gsap
    .timeline({ onComplete: () => dispatch("improve") })
    .to(path, { strokeDashoffset: 0, duration: 0.3, ease: "power2.out" })
    .call(() => dispatch("rewrite"))
    .fromTo(
      card.querySelector("[data-score-highlight]"),
      { opacity: 0 },
      { opacity: 1, duration: 0.2 },
    )
    .to(count, {
      impact: scoreBars[0].value,
      duration: 0.3,
      onUpdate: () => setScore(card, beforeScore, Math.round(count.impact)),
    })
    .to(count, {
      value: afterScore,
      duration: 0.3,
      onUpdate: () =>
        setScore(card, Math.round(count.value), scoreBars[0].value),
    });
}

function reduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useScoreEntry(
  ref: RefObject<HTMLDivElement | null>,
  animation: RefObject<Timeline | null>,
  dispatch: (event: Event) => void,
) {
  useEffect(() => {
    const card = ref.current;
    if (!card) {
      return;
    }
    let cancelled = false;
    const enter = () => {
      dispatch("enter");
      if (reduced()) {
        dispatch("counted");
        return;
      }
      void loadGsap().then(({ gsap }) => {
        if (!cancelled) {
          animation.current = animateEntry(gsap, card, () =>
            dispatch("counted"),
          );
        }
      });
    };
    const stop = visibleOnce(card, enter);
    return () => {
      cancelled = true;
      stop();
      animation.current?.kill();
    };
  }, [ref, animation, dispatch]);
}

export function useScoreDemoMotion() {
  const ref = useRef<HTMLDivElement>(null);
  const animation = useRef<Timeline | null>(null);
  const [stage, dispatch] = useReducer(scoreDemoReducer, "idle");
  useScoreEntry(ref, animation, dispatch);

  const accept = useCallback(() => {
    const card = ref.current;
    if (stage !== "flagged" || !card) {
      return;
    }
    dispatch("accept");
    if (reduced()) {
      dispatch("rewrite");
      dispatch("improve");
      return;
    }
    void loadGsap().then(({ gsap }) => {
      if (ref.current === card) {
        animation.current = animateAccept(gsap, card, dispatch);
      }
    });
  }, [stage]);

  const undo = useCallback(() => {
    if (stage !== "improved") {
      return;
    }
    animation.current?.kill();
    if (ref.current) {
      setScore(ref.current, beforeScore, scoreBars[0].before);
    }
    dispatch("undo");
  }, [stage]);

  return { ref, stage, accept, undo };
}
