"use client";
import { useT } from "@/components/i18n/i18n-provider";
import MatchDemo from "../../product-demos/match-demo";
import ExportDemo from "../../product-demos/export-demo";
import SkillGapsDemo from "./skill-gaps-demo";
import styles from "./support.module.css";

export default function ReportSupport() {
  const { t } = useT();
  return (
    <div className={styles.grid} data-report-support>
      <article className={styles.card}>
        <h3>{t("landing.report.match")}</h3>
        <MatchDemo />
      </article>
      <article className={styles.card}>
        <h3>{t("landing.report.export")}</h3>
        <ExportDemo />
      </article>
      <article className={styles.card}>
        <h3>{t("landing.report.gaps")}</h3>
        <SkillGapsDemo />
      </article>
    </div>
  );
}
