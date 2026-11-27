import { useT } from "@/components/i18n/i18n-provider";
import type { VersionData } from "@/lib/app-api/history.types";
import { versionSummaryText } from "@/lib/app-report/version-summary";
import { useAppReportFormat } from "@/hooks/use-app-report-format";
import styles from "../workspace-styles";

export function HistoryVersionCard({
  version,
  onCompare,
  onRestore,
}: {
  version: VersionData;
  onCompare: () => void;
  onRestore: () => void;
}) {
  const { t } = useT();
  const { dateTime } = useAppReportFormat();
  return (
    <article className={styles.group}>
      <strong>
        {version.label} · {dateTime(version.at)}
      </strong>{" "}
      {version.current && (
        <span className={styles.eyebrow}>
          {t("appWorkspacePanel.history.current")}
        </span>
      )}
      <p>
        {t("appWorkspacePanel.history.score", { score: version.score })}
        {version.delta !== null && ` (+${version.delta})`}.{" "}
        {versionSummaryText(t, version, version.delta)}
      </p>
      <div className={styles.row}>
        <button
          type="button"
          className={`${styles.pill} ${styles.snow}`}
          onClick={onCompare}
        >
          {version.current
            ? t("appWorkspacePanel.history.changes")
            : t("appWorkspacePanel.history.compare")}
        </button>
        {!version.current && (
          <button
            type="button"
            className={`${styles.pill} ${styles.snow}`}
            onClick={onRestore}
          >
            {t("appWorkspacePanel.history.restore")}
          </button>
        )}
      </div>
    </article>
  );
}
