import { scoreBars } from "@/lib/landing-report";
import styles from "./report.module.css";
import PenStrike from "../../pen/pen-strike";
import PenHighlight from "../../pen/pen-highlight";
export default function ScoreCard() {
  return (
    <div
      data-report-card
      className={styles.card}
      role="img"
      aria-label="Sample score report: overall 86, with four dimension bars and one flagged line"
      aria-describedby="report-score-ring-note"
    >
      <div className={styles.top}>
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
        <span className={styles.before}>
          Led a team of developers on the checkout rebuild.
          <PenStrike variant={0} delay={0.2} />
        </span>
        <strong className={styles.after}>
          Led the checkout rebuild with a team of developers.
          <PenHighlight variant={1} delay={0.4} onDark />
        </strong>
        <span className={styles.chip}>Accept rewrite</span>
      </div>
    </div>
  );
}
