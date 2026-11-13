import { USE_APP_MOCKS } from "@/lib/app-api/mode";
import type { ReportDetail } from "@/lib/app-api/report-detail.types";
import styles from "./report.module.css";

export function ReportToolbar({
  data,
  jobId,
  onExport,
}: {
  data: ReportDetail;
  jobId: string;
  onExport: () => void;
}) {
  return (
    <header className={styles.top}>
      <div>
        <h1>Full report</h1>
        <p>
          {data.fileName} · {data.role} · {data.version}{" "}
          {USE_APP_MOCKS && <span className={styles.chip}>Sample data</span>}
        </p>
      </div>
      <div className={styles.actions}>
        <a
          className={`${styles.pill} ${styles.snow}`}
          href={`/app/cvs/${encodeURIComponent(jobId)}?view=editor`}
        >
          Back to editor
        </a>
        <button
          type="button"
          className={`${styles.pill} ${styles.punk}`}
          onClick={onExport}
        >
          Export
        </button>
      </div>
    </header>
  );
}
