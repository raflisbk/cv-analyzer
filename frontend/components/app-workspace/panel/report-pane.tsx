import HelpButton from "@/components/pathy/help-button";
import type { ScoreResult } from "@/lib/types";
import { ScoreBar } from "../score-bar";
import { ReportChecks } from "./report-checks";
import { ReportStatus } from "./report-status";
import styles from "../workspace-styles";

interface Props {
  scores: ScoreResult | null | undefined;
  error?: boolean;
  openFixes: () => void;
  fixCount: number;
  bonus: number;
}

export function ReportPane({
  scores,
  error,
  openFixes,
  fixCount,
  bonus,
}: Props) {
  if (!scores || error) {
    return <ReportStatus error={error} />;
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
      <ReportChecks fixCount={fixCount} />
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
