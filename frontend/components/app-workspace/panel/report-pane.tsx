import HelpButton from "@/components/pathy/help-button";
import type { ScoreResult } from "@/lib/types";
import { ScoreBar } from "../score-bar";
import styles from "../workspace-styles";

export function ReportPane({
  scores,
  openFixes,
  fixCount,
  bonus,
}: {
  scores: ScoreResult | null | undefined;
  openFixes: () => void;
  fixCount: number;
  bonus: number;
}) {
  if (!scores) {
    return (
      <div className={styles.pane} role="status">
        Your report is still processing.
      </div>
    );
  }
  return (
    <div className={styles.pane}>
      <div className={styles.row}>
        <span className={styles.eyebrow}>Overall score</span>
        <HelpButton helpKey="paneReport" />
      </div>
      <h2 className={styles.big}>
        {Math.min(100, scores.overall + bonus)} <small>of 100</small>
      </h2>
      <ScoreBar label="Impact" score={scores.impact} />
      <ScoreBar label="Clarity" score={scores.clarity} />
      <ScoreBar label="Relevance" score={scores.relevance} />
      <ScoreBar label="Completeness" score={scores.completeness} />
      <div className={styles.check}>
        <span className={styles.checkIcon}>✓</span>Clear, readable structure
      </div>
      <div className={styles.check}>
        <span className={styles.checkIcon}>✓</span>Skills match the target role
      </div>
      <div className={styles.check}>
        <span className={styles.checkIcon}>!</span>
        {fixCount} fixes left to review
      </div>
      <button
        type="button"
        className={`${styles.pill} ${styles.punk}`}
        onClick={openFixes}
      >
        Review {fixCount} fixes
      </button>
    </div>
  );
}
