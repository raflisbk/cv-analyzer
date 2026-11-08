import { scoreBars } from "@/lib/landing-report";
import styles from "./report.module.css";
export default function ScoreCard() {
  return (
    <div
      data-report-card
      className={styles.card}
      role="img"
      aria-label="Sample score report: overall 86, with four dimension bars and one flagged line"
    >
      <div className={styles.top}>
        <div className={styles.ring}>
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
        <div className={styles.bars}>
          {scoreBars.map((bar) => (
            <div className={styles.bar} key={bar.label}>
              <span>{bar.label}</span>
              <i>
                <i
                  data-score-bar={bar.value}
                  style={{ width: `${bar.value}%` }}
                />
              </i>
              <span>{bar.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div data-rewrite className={styles.rewrite}>
        <span className={styles.flag}>No number</span>
        <s>Led a team of developers on the checkout rebuild.</s>
        <strong>
          Led 6 engineers on the checkout rebuild, cutting load time 40%.
        </strong>
        <span className={styles.chip}>Accept rewrite</span>
      </div>
    </div>
  );
}
