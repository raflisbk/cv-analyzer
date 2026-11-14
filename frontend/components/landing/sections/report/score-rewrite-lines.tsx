"use client";
import { useT } from "@/components/i18n/i18n-provider";
import PenStrike from "../../pen/pen-strike";
import PenHighlight from "../../pen/pen-highlight";
import type { ScoreDemoStage } from "@/lib/landing-score-demo";
import styles from "./report.module.css";

export default function ScoreRewriteLines({
  stage,
}: {
  stage: ScoreDemoStage;
}) {
  const { t } = useT();
  const rewritten = stage === "rewritten" || stage === "improved";
  return (
    <>
      <span
        className={`${styles.flag} ${stage === "idle" || stage === "counting" ? styles.hidden : ""}`}
      >
        {t("landing.report.flag")}
      </span>
      <span className={styles.before}>
        {t("landing.report.before")}
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
        {t("landing.report.after")}
        <span data-score-highlight>
          <PenHighlight variant={1} play={false} onDark />
        </span>
      </strong>
    </>
  );
}
