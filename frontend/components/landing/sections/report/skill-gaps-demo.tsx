"use client";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./support.module.css";

export default function SkillGapsDemo() {
  const { t } = useT();
  return (
    <div className={styles.gaps} aria-label={t("landing.report.gaps")}>
      <span>{t("landing.report.missing")}</span>
      <div>
        <span>SQL</span>
        <span>A/B testing</span>
      </div>
    </div>
  );
}
