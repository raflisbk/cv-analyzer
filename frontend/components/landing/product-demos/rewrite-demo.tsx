"use client";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./demos.module.css";
import PenStrike from "../pen/pen-strike";
import PenHighlight from "../pen/pen-highlight";

export default function RewriteDemo() {
  const { t } = useT();
  return (
    <div className={styles.rewrite}>
      <span className={styles.tag}>{t("landing.report.flag")}</span>
      <span data-demo-before className={styles.rewriteLine}>
        {t("landing.report.before")}
        <PenStrike play={false} />
      </span>
      <strong data-demo-after className={styles.rewriteLine}>
        {t("landing.report.after")}
        <PenHighlight play={false} />
      </strong>
      <button
        type="button"
        disabled
        className={styles.accept}
        aria-label={t("landing.report.sampleAccepted")}
      >
        {t("landing.report.accept")} ✓
      </button>
    </div>
  );
}
