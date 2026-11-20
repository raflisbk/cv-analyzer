import { useT } from "@/components/i18n/i18n-provider";
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
  const { t } = useT();
  return (
    <header className={styles.top}>
      <div>
        <h1>{t("appReport.toolbar.title")}</h1>
        <p>
          {[data.fileName, data.role, data.version]
            .filter((part) => part?.trim())
            .join(" · ")}{" "}
          {USE_APP_MOCKS && (
            <span className={styles.chip}>{t("appReport.toolbar.sample")}</span>
          )}
        </p>
      </div>
      <div className={styles.actions}>
        <a
          className={`${styles.pill} ${styles.snow}`}
          href={`/app/cvs/${encodeURIComponent(jobId)}?view=editor`}
        >
          {t("appReport.toolbar.back")}
        </a>
        <button
          type="button"
          className={`${styles.pill} ${styles.punk}`}
          onClick={onExport}
        >
          {t("appReport.toolbar.export")}
        </button>
      </div>
    </header>
  );
}
