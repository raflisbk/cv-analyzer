import PenStrike from "../../pen/pen-strike";
import PenHighlight from "../../pen/pen-highlight";
import { scoreRewrite } from "@/lib/landing-report";
import type { ScoreDemoStage } from "@/lib/landing-score-demo";
import styles from "./report.module.css";

export default function ScoreRewrite({
  stage,
  onAccept,
  onUndo,
}: {
  stage: ScoreDemoStage;
  onAccept: () => void;
  onUndo: () => void;
}) {
  const rewritten = stage === "rewritten" || stage === "improved";
  return (
    <div data-rewrite className={styles.rewrite}>
      <span
        className={`${styles.flag} ${stage === "idle" || stage === "counting" ? styles.hidden : ""}`}
      >
        {scoreRewrite.flag}
      </span>
      <span className={styles.before}>
        {scoreRewrite.before}
        <span
          data-score-strike
          className={
            stage === "struck" || rewritten ? styles.visible : styles.hidden
          }
        >
          <PenStrike variant={0} play={false} />
        </span>
      </span>
      <strong
        className={`${styles.after} ${rewritten ? styles.visible : styles.hidden}`}
      >
        {scoreRewrite.after}
        <span data-score-highlight>
          <PenHighlight variant={1} play={false} onDark />
        </span>
      </strong>
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
