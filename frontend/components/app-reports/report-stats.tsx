"use client";

import type { ReportsData } from "@/lib/app-api/reports.types";
import { useT } from "@/components/i18n/i18n-provider";
import { relativeDate } from "@/lib/i18n/format-date";
import styles from "./reports.module.css";

export default function ReportStats({ data }: { data: ReportsData }) {
  const { t, locale } = useT();
  return (
    <div className={styles.stats}>
      <div>
        <strong>{t("app.reports.statReports")}</strong>
        <b>{data.aggregate.count}</b>
        <small>
          {t("app.reports.acrossCvs", { count: data.aggregate.count })}
        </small>
      </div>
      <div>
        <strong>{t("app.reports.bestScore")}</strong>
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
        <strong>{t("app.reports.averageImpact")}</strong>
        <b>{data.aggregate.averageImpact}</b>
        <small>{t("app.reports.weakest")}</small>
      </div>
      <div>
        <strong>{t("app.reports.lastAnalysis")}</strong>
        <b>{relativeDate(locale, data.aggregate.lastAnalysisAt)}</b>
        <small>
          {t("app.reports.openFixes", { count: data.aggregate.openFixes })}
        </small>
      </div>
    </div>
  );
}
