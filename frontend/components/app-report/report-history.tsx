import type { ReportDetail } from "@/lib/app-api/report-detail.types";
import { formatDate, formatDelta } from "@/lib/app-report/format";
import { ReportHeading } from "./report-heading";
import { ReportHistoryChart } from "./report-history-chart";
import styles from "./report.module.css";

export function ReportHistory({
  versions,
  projectedScore,
}: {
  versions: ReportDetail["versions"];
  projectedScore: number;
}) {
  return (
    <section
      className={`${styles.card} ${styles.span12}`}
      id="report-history"
      aria-label="Score history"
    >
      <ReportHeading title="Score history" helpKey="history" />
      <ReportHistoryChart versions={versions} projectedScore={projectedScore} />
      <div className={styles.historyCards}>
        {versions.map((version, index) => (
          <div key={version.label}>
            <strong>
              {version.label} · {formatDate(version.at)}
            </strong>
            <span>{version.summary}</span>
            {index > 0 && (
              <small>
                {" "}
                {formatDelta(version.score - versions[index - 1].score)}
              </small>
            )}
          </div>
        ))}
        <div>
          <strong>Next</strong>Open fixes could lift your score to{" "}
          {projectedScore}.
        </div>
      </div>
      <p className={styles.caption}>
        Each analysis adds a point. The last point is a projection, not an
        analyzed version.
      </p>
    </section>
  );
}
