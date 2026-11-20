"use client";

import { useT } from "@/components/i18n/i18n-provider";
import { useAppReportFormat } from "@/hooks/use-app-report-format";
import { useAppReportScoreReveal } from "@/hooks/use-app-report-score-reveal";
import type { ReportDetail } from "@/lib/app-api/report-detail.types";
import { USE_APP_MOCKS } from "@/lib/app-api/mode";
import { ReportHeading } from "./report-heading";
import { ScoreRing } from "./score-ring";
import { ReportPercentile } from "./report-percentile";
import styles from "./report.module.css";

export function ReportOverallCard({ data }: { data: ReportDetail }) {
  const shown = useAppReportScoreReveal(data.score);
  const { t } = useT();
  const { delta } = useAppReportFormat();
  return (
    <section
      className={`${styles.card} ${styles.deep} ${styles.span4}`}
      data-tour="report-scores"
    >
      <ReportHeading
        title={t(
          USE_APP_MOCKS
            ? "appReport.overall.titleSample"
            : "appReport.overall.title",
        )}
        helpKey="overall"
      />
      <ScoreRing score={shown} large />
      <p>{t("appReport.overall.body")}</p>
      {data.role?.trim() && data.topPercent > 0 && (
        <ReportPercentile topPercent={data.topPercent} />
      )}
      <div className={styles.facts}>
        {data.facts.map((fact) => (
          <span key={fact}>{fact}</span>
        ))}
      </div>
      <p className={styles.caption}>{t("appReport.overall.caption")}</p>
      <div className={styles.facts}>
        {data.versions.length > 1 && (
          <span>
            {t("appReport.hero.since", {
              delta: delta(data.score - data.previousScore),
            })}
          </span>
        )}
        {data.role?.trim() && data.topPercent > 0 && (
          <span>
            {t("appReport.overall.top", {
              percent: data.topPercent,
              role: data.role,
            })}
          </span>
        )}
      </div>
    </section>
  );
}
