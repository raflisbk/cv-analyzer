import { scoreBars } from "@/lib/landing-report";
import styles from "./report.module.css";
import ScoreCardRing from "./score-card-ring";
import ScoreRewrite from "./score-rewrite";
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
        <ScoreCardRing />
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
      <ScoreRewrite />
    </div>
  );
}
