"use client";

import { useEffect, useState } from "react";
import { usePathy } from "@/components/pathy/pathy-context";

export function useAppReportScoreReveal(score: number) {
  const [shown, setShown] = useState(0);
  const pathy = usePathy();
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      setShown(score);
      pathy.react(
        score >= 75 ? "proud" : "think",
        `Your CV scored ${score} out of 100.`,
      );
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 1100, 1);
      setShown(Math.round(score * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else
        pathy.react(
          score >= 75 ? "proud" : "think",
          `Your CV scored ${score} out of 100.`,
        );
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score, pathy]);
  return shown;
}
