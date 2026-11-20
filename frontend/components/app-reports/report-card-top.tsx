"use client";

import type { ReportSummary } from "@/lib/app-api/reports.types";
import { useT } from "@/components/i18n/i18n-provider";
import { fileMeta } from "@/lib/i18n/format-date";
import ReportSparkline from "./report-sparkline";
import styles from "./reports.module.css";

export default function ReportCardTop({ report }: { report: ReportSummary }) {
  const { t, locale } = useT();
  const first = report.versions[0]?.score ?? report.score;
  const last = report.versions.at(-1)?.score ?? report.score;
  return (
    <div className={styles.cardTop}>
      <span className={styles.score}>{report.score}</span>
      <div className={styles.cardMeta}>
        <h2>{report.fileName}</h2>
        <small>
          {fileMeta(
            locale,
            report.role,
            t("app.reports.analyzed"),
            report.analyzedAt,
          )}
        </small>
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
