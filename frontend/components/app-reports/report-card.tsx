import Link from "next/link";
import type { ReportSummary } from "@/lib/app-api/reports.types";
import { fileMeta } from "@/lib/app-shell/format";
import DimensionBars from "./dimension-bars";
import styles from "./reports.module.css";

export default function ReportCard({ report }: { report: ReportSummary }) {
  const first = report.versions[0]?.score ?? report.score;
  const last = report.versions.at(-1)?.score ?? report.score;
  const fromY = 46 - first * 0.4,
    toY = 46 - last * 0.4;
  return (
    <article className={styles.card} data-tour="report-card">
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
        <svg
          viewBox="0 0 120 56"
          role="img"
          aria-label="Score by version"
          className={styles.spark}
        >
          <polyline
            points={`12,${fromY} 108,${toY}`}
            fill="none"
            stroke="#b81d00"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="12" cy={fromY} r="4" fill="#b81d00" />
          <circle cx="108" cy={toY} r="4" fill="#b81d00" />
        </svg>
      </div>
      <div className={styles.facts}>
        <span>{report.fileFacts.type}</span>
        <span>
          {report.fileFacts.pages}{" "}
          {report.fileFacts.pages === 1 ? "page" : "pages"}
        </span>
        <span>{report.fileFacts.sizeKb} KB</span>
        <span>{report.fileFacts.bullets} bullets</span>
      </div>
      <DimensionBars values={report.dimensions} />
      <div className={styles.topFix}>
        <strong>Top fix</strong>
        <span>{report.topFix}</span>
      </div>
      <div className={styles.actions}>
        <Link href={`/app/cvs/${report.jobId}?view=report`}>Open report</Link>
        <Link href={`/app/cvs/${report.jobId}?view=editor`}>Edit CV</Link>
      </div>
    </article>
  );
}
