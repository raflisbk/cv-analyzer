import { scoreBars as demoScores } from "@/lib/landing-report";
import styles from "./demos.module.css";

export default function ScoreBarsDemo({
  compact = false,
}: {
  compact?: boolean;
}) {
  const scores = compact ? demoScores.slice(0, 2) : demoScores;
  return (
    <div className={styles.bars} aria-label="CV score dimensions">
      {scores.map(({ label, value }) => (
        <div className={styles.bar} key={label}>
          <span>{label}</span>
          <span
            className={styles.track}
            role="meter"
            aria-label={label}
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
