import styles from "./report.module.css";

export default function ScoreCardRing() {
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
          strokeDasharray="292 340"
        />
      </svg>
      <b>86</b>
    </div>
  );
}
