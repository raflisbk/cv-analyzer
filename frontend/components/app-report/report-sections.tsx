import type { ReportDetail } from "@/lib/app-api/report-detail.types";
import { ReportHeading } from "./report-heading";
import styles from "./report.module.css";

export function ReportSections({
  sections,
}: {
  sections: ReportDetail["sections"];
}) {
  return (
    <section
      className={`${styles.card} ${styles.span6}`}
      id="report-sections"
      aria-label="Section by section"
    >
      <ReportHeading title="Section by section" helpKey="sections" />
      <div className={styles.sectionRows}>
        {!sections.length && <p>No section scores available yet.</p>}
        {sections.map((section) => (
          <div
            className={styles.sectionRow}
            key={section.name}
            data-low={section.score < 70}
          >
            <span>{section.name}</span>
            <span
              className={styles.track}
              role="img"
              aria-label={`${section.name}: ${section.score} out of 100`}
            >
              <i style={{ width: `${section.score}%` }} />
            </span>
            <strong>{section.score}</strong>
            <small>{section.note}</small>
          </div>
        ))}
      </div>
      <p className={styles.caption}>
        Section scores weigh how much each section helps the target role.
      </p>
    </section>
  );
}
