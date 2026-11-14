"use client";
import { useT } from "@/components/i18n/i18n-provider";
import { demoTemplates } from "@/lib/landing-report";
import styles from "./document-demos.module.css";

export default function ExportDemo() {
  const { t } = useT();
  return (
    <div className={styles.export}>
      <div
        className={styles.page}
        role="img"
        aria-label={t("landing.report.demo.pdfPreview")}
      >
        <strong>Samuel Samdono</strong>
        <span>{t("landing.report.demo.designer")}</span>
        <i />
        <i />
        <i className={styles.short} />
        <b>{t("landing.report.demo.experience")}</b>
        <i />
        <i className={styles.short} />
        <span className={styles.ready}>
          ✓ {t("landing.report.demo.atsReady")}
        </span>
      </div>
      <div
        className={styles.templates}
        aria-label={t("landing.report.demo.templateLabel")}
      >
        {demoTemplates.map((name) => (
          <span key={name}>{t(`landing.report.demo.${name}`)}</span>
        ))}
      </div>
    </div>
  );
}
