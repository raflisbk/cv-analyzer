"use client";
import { scoreBars } from "@/lib/landing-report";
import { beforeScore } from "@/lib/landing-score-demo";
import { useScoreDemoMotion } from "@/components/landing/motion/score-demo";
import styles from "./report.module.css";
import ScoreCardRing from "./score-card-ring";
import ScoreRewrite from "./score-rewrite";
export default function ScoreCard() {
  const { ref, stage, accept, undo } = useScoreDemoMotion();
  const accepted = stage === "improved";
  return (
    <div ref={ref} data-report-card className={styles.card}>
      <div className={styles.top}>
        <ScoreCardRing score={accepted ? undefined : beforeScore} />
        <div className={styles.bars}>
          {scoreBars.map((bar) => (
            <div className={styles.bar} key={bar.label}>
              <span>{bar.label}</span>
              <i
                role="meter"
                aria-label={bar.label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={accepted ? bar.value : bar.before}
              >
                <i
                  data-score-bar
                  data-score-impact={bar.label === "Impact" ? "" : undefined}
                  style={{ width: `${accepted ? bar.value : bar.before}%` }}
                />
              </i>
              <span>{accepted ? bar.value : bar.before}</span>
            </div>
          ))}
        </div>
      </div>
      <ScoreRewrite stage={stage} onAccept={accept} onUndo={undo} />
    </div>
  );
}
