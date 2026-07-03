"use client";

import { useEffect, useState } from "react";

export function StreamingIndicator({ active }: { active: boolean }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (!active) {
    return null;
  }

  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full"
      style={{
        background: "#CAFF43",
        animation: prefersReducedMotion
          ? "none"
          : "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </span>
  );
}
