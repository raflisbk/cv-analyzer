import type { ReportSummary } from "@/lib/app-api/reports.types";
import { fileMeta } from "@/lib/app-shell/format";
import ReportSparkline from "./report-sparkline";
import styles from "./reports.module.css";

export default function ReportCardTop({ report }: { report: ReportSummary }) {
  const first = report.versions[0]?.score ?? report.score;
  const last = report.versions.at(-1)?.score ?? report.score;
  return (
    <div className={styles.cardTop}>
      <span className={styles.score}>{report.score}</span>
      <div className={styles.cardMeta}>
        <h2>{report.fileName}</h2>
        <small>{fileMeta(report.role, report.analyzedAt, "analyzed")}</small>
        <div className={styles.versions}>
          {[...report.versions].reverse().map((version, index) => (
            <span key={version.label} data-current={index === 0}>
              {version.label} ·{" "}
              {index === 0 && report.versions.length > 1
                ? `+${last - first}`
                : version.score}
            </span>
          ))}
        </div>
      </div>
      <ReportSparkline first={first} last={last} />
    </div>
  );
}
