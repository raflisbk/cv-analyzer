"use client";
import { useT } from "@/components/i18n/i18n-provider";
import { processSteps } from "@/lib/landing-process";
import styles from "./process.module.css";

const railPath =
  "M10 34 C110 4 190 64 290 34 S470 4 570 34 S750 64 850 34 S960 14 990 34";

export default function ProcessRail() {
  const { t } = useT();
  return (
    <div className={styles.rail} aria-hidden="true">
      <div className={styles.labels}>
        {processSteps.map((step) => (
          <span key={step.key}>
            {t(`landing.process.steps.${step.key}.label`)}
          </span>
        ))}
      </div>
      <svg viewBox="0 0 1000 60">
        <path
          data-rail-path
          d={railPath}
          fill="none"
          stroke="#756d6b"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          data-rail-done
          d={railPath}
          fill="none"
          stroke="var(--brand-punk)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle
          data-rider
          r="11"
          cx="10"
          cy="34"
          fill="var(--brand-punk)"
          stroke="var(--brand-ink)"
          strokeWidth="4"
        />
      </svg>
    </div>
  );
}
