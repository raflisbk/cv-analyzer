import type { ReportsData } from "@/lib/app-api/reports.types";
import { relativeDate } from "@/lib/app-shell/format";
import styles from "./reports.module.css";

export default function ReportStats({ data }: { data: ReportsData }) {
  return (
    <div className={styles.stats}>
      <div>
        <strong>Reports</strong>
        <b>{data.aggregate.count}</b>
        <small>across {data.aggregate.count} CVs</small>
      </div>
      <div>
        <strong>Best score</strong>
        <b>{data.aggregate.bestScore}</b>
        <small>
          {
            data.reports.find(
              (report) => report.score === data.aggregate.bestScore,
            )?.fileName
          }
        </small>
      </div>
      <div>
        <strong>Average impact</strong>
        <b>{data.aggregate.averageImpact}</b>
        <small>your weakest dimension</small>
      </div>
      <div>
        <strong>Last analysis</strong>
        <b>{relativeDate(data.aggregate.lastAnalysisAt)}</b>
        <small>{data.aggregate.openFixes} fixes still open</small>
      </div>
    </div>
  );
}
