"use client";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./demos.module.css";
import { afterScore } from "@/lib/landing-score-demo";

export default function ScoreRing({
  score = afterScore,
  label,
}: {
  score?: number;
  label?: string;
}) {
  const { t } = useT();
  const ringLabel = label ?? t("landing.report.ring");
  return (
    <div
      className={styles.ring}
      role="img"
      aria-label={t("landing.report.scoreOutOf", { label: ringLabel, score })}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="42" className={styles.ringTrack} />
        <circle
          data-demo-ring
          cx="50"
          cy="50"
          r="42"
          className={styles.ringValue}
          style={{ strokeDasharray: `${score * 2.64} 264` }}
        />
      </svg>
      <strong data-demo-count={score}>{score}</strong>
    </div>
  );
}
