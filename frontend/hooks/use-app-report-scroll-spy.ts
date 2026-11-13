"use client";

import { useEffect, useState } from "react";

export const reportSections = [
  "overview",
  "scores",
  "sections",
  "bullets",
  "language",
  "keywords",
  "ats",
  "history",
] as const;

export function useAppReportScrollSpy() {
  const [active, setActive] = useState<string>("overview");
  useEffect(() => {
    const elements = reportSections
      .map((id) => document.getElementById(`report-${id}`))
      .filter((element): element is HTMLElement => Boolean(element));
    if (!elements.length || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id.replace("report-", ""));
      },
      { rootMargin: "-8% 0px -65% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  return { active, setActive };
}
