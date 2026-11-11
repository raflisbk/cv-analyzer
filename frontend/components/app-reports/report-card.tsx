import Link from "next/link";
import type { ReportSummary } from "@/lib/app-api/reports.types";
import DimensionBars from "./dimension-bars";
import ReportCardTop from "./report-card-top";
import styles from "./reports.module.css";

export default function ReportCard({ report }: { report: ReportSummary }) {
  return (
    <article className={styles.card} data-tour="report-card">
      <ReportCardTop report={report} />
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
