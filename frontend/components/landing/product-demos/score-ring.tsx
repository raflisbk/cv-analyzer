import styles from "./demos.module.css";
import { afterScore } from "@/lib/landing-score-demo";

export default function ScoreRing({ score = afterScore }: { score?: number }) {
  return (
    <div
      className={styles.ring}
      role="img"
      aria-label={`Overall score ${score} out of 100`}
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
