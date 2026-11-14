"use client";
import { useT } from "@/components/i18n/i18n-provider";
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
  const { t } = useT();
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
          {stage === "improved"
            ? t("landing.report.accepted")
            : t("landing.report.accept")}
        </button>
        {stage === "improved" && (
          <button type="button" className={styles.undo} onClick={onUndo}>
            {t("landing.report.undo")}
          </button>
        )}
      </div>
    </div>
  );
}
