import type { ScoreDemoStage } from "@/lib/landing-score-demo";
import styles from "./report.module.css";
import ScoreRewriteLines from "./score-rewrite-lines";

export default function ScoreRewrite({
  stage,
  onAccept,
  onUndo,
}: {
  stage: ScoreDemoStage;
  onAccept: () => void;
  onUndo: () => void;
}) {
  return (
    <div data-rewrite className={styles.rewrite}>
      <ScoreRewriteLines stage={stage} />
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.chip}
          onClick={onAccept}
          disabled={stage !== "flagged"}
        >
          {stage === "improved" ? "✓ Accepted" : "Accept rewrite"}
        </button>
        {stage === "improved" && (
          <button type="button" className={styles.undo} onClick={onUndo}>
            Undo
          </button>
        )}
      </div>
    </div>
  );
}
