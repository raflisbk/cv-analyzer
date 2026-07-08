"use client";

const items = [
  "AI Scoring",
  "Grammar Check",
  "ATS Compliance",
  "Skill Gap Analysis",
  "JD Comparison",
  "Inline Edit",
  "AI Chat",
  "1,088 Role Archetypes",
  "195+ Skills",
  "2 Languages",
];

const separator = (
  <span className="mx-6 text-[#CAFF43] opacity-40" aria-hidden="true">
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
      <path d="M4 0L5 3L8 4L5 5L4 8L3 5L0 4L3 3Z" fill="currentColor" />
    </svg>
  </span>
);

export default function MarqueeSection() {
  return (
    <section
      className="overflow-hidden py-6"
      style={{
        background: "#1A170F",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="marquee-track">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center whitespace-nowrap">
            {i > 0 && separator}
            <span className="text-sm md:text-base font-bold tracking-wide text-[#F5F2D8]/30 uppercase">
              {item}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
