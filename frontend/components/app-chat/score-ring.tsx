import type { CSSProperties } from "react";
import styles from "./score.module.css";

export default function ScoreRing({
  score,
  label,
}: {
  score: number;
  label: string;
}) {
  const percent = Math.max(0, Math.min(100, score));
  return (
    <div
      className={styles.ring}
      style={{ "--pct": `${percent}%` } as CSSProperties}
      role="img"
      aria-label={label}
    >
      <span aria-hidden="true">{score}</span>
    </div>
  );
}
