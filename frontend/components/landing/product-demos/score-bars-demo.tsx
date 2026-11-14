"use client";
import { useT } from "@/components/i18n/i18n-provider";
import { scoreBars as demoScores } from "@/lib/landing-report";
import styles from "./demos.module.css";

export default function ScoreBarsDemo({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { t } = useT();
  const scores = compact ? demoScores.slice(0, 2) : demoScores;
  return (
    <div className={styles.bars} aria-label={t("landing.report.dimensions")}>
      {scores.map(({ key, value }) => (
        <div className={styles.bar} key={key}>
          <span>{t(`landing.report.bars.${key}`)}</span>
          <span
            className={styles.track}
            role="meter"
            aria-label={t(`landing.report.bars.${key}`)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
          >
            <span data-demo-bar={value} style={{ width: `${value}%` }} />
          </span>
          <b>{value}</b>
        </div>
      ))}
    </div>
  );
}
