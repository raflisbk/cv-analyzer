import { useT } from "@/components/i18n/i18n-provider";
import { useAppReportFormat } from "@/hooks/use-app-report-format";
import type { ReportDetail } from "@/lib/app-api/report-detail.types";
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
  const { t } = useT();
  const { date, delta } = useAppReportFormat();
  return (
    <section
      className={`${styles.card} ${styles.span12}`}
      id="report-history"
      aria-label={t("appReport.history.title")}
    >
      <ReportHeading title={t("appReport.history.title")} helpKey="history" />
      <ReportHistoryChart versions={versions} projectedScore={projectedScore} />
      <div className={styles.historyCards}>
        {!versions.length && <p>{t("appReport.history.none")}</p>}
        {versions.map((version, index) => (
          <div key={version.label}>
            <strong>
              {version.label} · {date(version.at)}
            </strong>
            <span>{version.summary}</span>
            {index > 0 && (
              <small> {delta(version.score - versions[index - 1].score)}</small>
            )}
          </div>
        ))}
        <div>
          <strong>{t("appReport.history.next")}</strong>
          {t("appReport.history.lift", { score: projectedScore })}
        </div>
      </div>
      <p className={styles.caption}>{t("appReport.history.caption")}</p>
    </section>
  );
}
