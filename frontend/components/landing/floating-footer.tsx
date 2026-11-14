"use client";

import { formatLandingCount, landingFacts } from "@/lib/landing-facts";
import { useT } from "@/components/i18n/i18n-provider";

const separator = (
  <span className="mx-6 text-[var(--brand-punk)] opacity-40" aria-hidden="true">
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
      <path d="M4 0L5 3L8 4L5 5L4 8L3 5L0 4L3 3Z" fill="currentColor" />
    </svg>
  </span>
);

export default function FloatingFooter() {
  const { t, locale } = useT();
  const marqueeItems = [
    t("landing.ticker.scoring"),
    t("landing.ticker.grammar"),
    t("landing.ticker.ats"),
    t("landing.ticker.gaps"),
    t("landing.ticker.jd"),
    t("landing.ticker.inline"),
    t("landing.ticker.editor"),
    t("landing.ticker.archetypes", {
      count: formatLandingCount(landingFacts.archetypeCount, false, locale),
    }),
    t("landing.ticker.domains", {
      count: formatLandingCount(landingFacts.domainCount, false, locale),
    }),
    t("landing.ticker.checks", {
      count: formatLandingCount(landingFacts.atsCheckCount, false, locale),
    }),
    t("landing.ticker.languages", {
      count: formatLandingCount(landingFacts.languages.length, false, locale),
    }),
  ];
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 overflow-hidden pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
      style={{
        background: "var(--brand-ink)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="marquee-track">
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          <span key={i} className="flex items-center whitespace-nowrap">
            {i > 0 && separator}
            <span className="text-[13px] font-semibold text-[var(--brand-snow)] opacity-55">
              {item}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
