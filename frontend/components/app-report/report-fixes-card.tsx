import type { ReportDetail } from "@/lib/app-api/report-detail.types";
import { ReportHeading } from "./report-heading";
import styles from "./report.module.css";

export function ReportFixesCard({
  data,
  fixHref,
}: {
  data: ReportDetail;
  fixHref: string;
}) {
  return (
    <section className={`${styles.card} ${styles.yellow} ${styles.span4}`}>
      <ReportHeading
        title={`If you apply ${data.fixes.length} fixes`}
        helpKey="fixesCard"
      />
      <div className={styles.bars}>
        {data.dimensions.slice(0, 3).map((dimension) => (
          <div key={dimension.key}>
            <div className={styles.barLabel}>
              <span>
                {dimension.key[0].toUpperCase() + dimension.key.slice(1)}
              </span>
              <span>
                {dimension.score} → {dimension.projected}
              </span>
            </div>
            <span className={styles.track}>
              <i style={{ width: `${dimension.score}%` }} />
            </span>
          </div>
        ))}
      </div>
      <div className={styles.fixList}>
        {!data.fixes.length && <p>No suggested fixes available.</p>}
        {data.fixes.map((fix) => (
          <div key={fix.title}>
            <b>+{fix.points}</b>
            <span>{fix.text}</span>
          </div>
        ))}
      </div>
      <p>
        Projected score:{" "}
        <strong>
          {data.score} → {data.projectedScore}
        </strong>
      </p>
      <a className={`${styles.pill} ${styles.punk}`} href={fixHref}>
        Review the fixes
      </a>
    </section>
  );
}
