"use client";

import { useEffect, useState } from "react";

export function useAppShellScoreCount(complete: boolean, score: number) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!complete || !score) {
      return;
    }
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(score, current + Math.ceil(score / 20));
      setCount(current);
      if (current >= score) {
        clearInterval(timer);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [complete, score]);
  return count;
}
