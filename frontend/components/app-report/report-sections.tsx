import { useT } from "@/components/i18n/i18n-provider";
import { reportSectionName, reportSectionNote } from "@/lib/app-report/copy";
import type { ReportDetail } from "@/lib/app-api/report-detail.types";
import { ReportHeading } from "./report-heading";
import styles from "./report.module.css";

export function ReportSections({
  sections,
}: {
  sections: ReportDetail["sections"];
}) {
  const { t } = useT();
  return (
    <section
      className={`${styles.card} ${styles.span6}`}
      id="report-sections"
      aria-label={t("appReport.sections.title")}
    >
      <ReportHeading title={t("appReport.sections.title")} helpKey="sections" />
      <div className={styles.sectionRows}>
        {!sections.length && <p>{t("appReport.sections.none")}</p>}
        {sections.map((section) => (
          <div
            className={styles.sectionRow}
            key={section.name}
            data-low={section.score < 70}
          >
            <span>{reportSectionName(t, section)}</span>
            <span
              className={styles.track}
              role="img"
              aria-label={t("appReport.sections.label", {
                name: reportSectionName(t, section),
                score: section.score,
              })}
            >
              <i style={{ width: `${section.score}%` }} />
            </span>
            <strong>{section.score}</strong>
            <small>{reportSectionNote(t, section)}</small>
          </div>
        ))}
      </div>
      <p className={styles.caption}>{t("appReport.sections.caption")}</p>
    </section>
  );
}
