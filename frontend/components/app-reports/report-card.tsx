"use client";

import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";
import type { ReportSummary } from "@/lib/app-api/reports.types";
import DimensionBars from "./dimension-bars";
import ReportCardTop from "./report-card-top";
import styles from "./reports.module.css";

export default function ReportCard({ report }: { report: ReportSummary }) {
  const { t } = useT();
  return (
    <article className={styles.card} data-tour="report-card">
      <ReportCardTop report={report} />
      <div className={styles.facts}>
        <span>{report.fileFacts.type}</span>
        <span>
          {report.fileFacts.pages}{" "}
          {t(
            report.fileFacts.pages === 1
              ? "app.reports.page"
              : "app.reports.pages",
          )}
        </span>
        <span>{report.fileFacts.sizeKb} KB</span>
        <span>
          {report.fileFacts.bullets} {t("app.reports.bullets")}
        </span>
      </div>
      <DimensionBars values={report.dimensions} />
      <div className={styles.topFix}>
        <strong>{t("app.reports.topFix")}</strong>
        <span>{report.topFix}</span>
      </div>
      <div className={styles.actions}>
        <Link href={`/app/cvs/${report.jobId}?view=report`}>
          {t("app.reports.openReport")}
        </Link>
        <Link href={`/app/cvs/${report.jobId}?view=editor`}>
          {t("app.reports.editCv")}
        </Link>
      </div>
    </article>
  );
}
