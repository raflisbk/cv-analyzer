import styles from "./report.module.css";
import { afterScore } from "@/lib/landing-score-demo";

export default function ScoreCardRing({
  score = afterScore,
}: {
  score?: number;
}) {
  return (
    <div
      className={styles.ring}
      id="report-score-ring"
      aria-describedby="report-score-ring-note"
    >
      <svg viewBox="0 0 130 130" aria-hidden="true">
        <circle
          cx="65"
          cy="65"
          r="54"
          fill="none"
          stroke="#544b49"
          strokeWidth="14"
        />
        <circle
          data-ring
          cx="65"
          cy="65"
          r="54"
          fill="none"
          stroke="var(--brand-punk)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${score * 3.4} 340`}
        />
      </svg>
      <b data-score-number aria-live="polite" aria-atomic="true">
        {score}
      </b>
    </div>
  );
}
