"use client";

import { useQuery } from "@tanstack/react-query";
import { useT } from "@/components/i18n/i18n-provider";
import { listReports } from "@/lib/app-api/reports";
import ListHeader from "@/components/app-shell/list-header";
import EmptyState from "@/components/app-shell/empty-state";
import LoadingSkeleton from "@/components/app-shell/loading-skeleton";
import ReportCard from "./report-card";
import ReportInsights from "./report-insights";
import ReportStats from "./report-stats";
import shell from "@/components/app-shell/app-shell.module.css";
import styles from "./reports.module.css";

export default function ReportsList() {
  const { t } = useT();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["app-reports"],
    queryFn: listReports,
  });
  return (
    <section className={`${shell.sheet} ${styles.list}`}>
      <ListHeader type="reports" />
      {isLoading && <LoadingSkeleton label={t("app.reports.loading")} />}
      {isError && (
        <p role="alert">
          {t("app.reports.loadError")}{" "}
          <button onClick={() => refetch()}>{t("app.reports.retry")}</button>
        </p>
      )}
      {data?.reports.length === 0 && <EmptyState type="reports" />}
      {data && data.reports.length > 0 && (
        <>
          <ReportStats data={data} />
          <div className={styles.cards}>
            {data.reports.map((report) => (
              <ReportCard report={report} key={report.jobId} />
            ))}
          </div>
          <ReportInsights aggregate={data.aggregate} />
        </>
      )}
    </section>
  );
}
