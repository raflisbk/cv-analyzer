"use client";

import { useEffect, useState } from "react";

/* Fixed dot navigation on the right edge (scroll-spy section pagination,
   the cloudstudio.es-style pager): one dot per landing section, the dot
   whose section crosses the viewport's vertical center is active, clicking
   a dot scrolls to its section.
   Deliberately slim: dots only (~10px rail at the extreme edge) so it never
   fights section content for space — labels are absolutely positioned and
   appear on hover, taking no layout width. The rail uses
   mix-blend-difference with cream dots so it stays legible over both the
   cream and the dark sections without tracking section themes manually. */

const SECTIONS = [
  { id: "hero", label: "Start" },
  { id: "products", label: "Products" },
  { id: "report", label: "Score report" },
  { id: "stickers", label: "Benefits" },
  { id: "features", label: "Open your CV" },
  { id: "how", label: "How it works" },
  { id: "inside", label: "Features" },
  { id: "stats", label: "Stats" },
  { id: "faq", label: "FAQ" },
  { id: "start", label: "Get started" },
];

export default function SectionDots() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (!section) {
      return;
    }
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    section.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      // A section is "active" while it overlaps the viewport's center line
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Page sections"
      className="fixed right-2.5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-1 lg:flex"
      style={{ mixBlendMode: "difference" }}
    >
      {SECTIONS.map(({ id, label }) => {
        const active = activeId === id;
        return (
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-current={active ? "true" : undefined}
            onClick={() => scrollToSection(id)}
            className="group relative flex min-h-11 min-w-11 items-center justify-center p-1"
          >
            {/* Hover label — absolutely positioned so the rail itself stays
                ~10px wide and never claims layout space from the sections */}
            <span
              className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.25em] text-[#F5F2D8] opacity-0 transition-opacity duration-200 group-hover:opacity-60"
              aria-hidden="true"
            >
              {label}
            </span>
            <span
              className={`block w-2 rounded-full border border-[#F5F2D8] transition-all duration-300 ${
                active
                  ? "h-5 bg-[#F5F2D8]"
                  : "h-2 bg-transparent group-hover:bg-[#F5F2D8]/40"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
