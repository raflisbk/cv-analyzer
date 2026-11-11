"use client";

import { useQuery } from "@tanstack/react-query";
import { listReports } from "@/lib/app-api/reports";
import ListHeader from "@/components/app-shell/list-header";
import EmptyState from "@/components/app-shell/empty-state";
import ReportCard from "./report-card";
import ReportInsights from "./report-insights";
import ReportStats from "./report-stats";
import shell from "@/components/app-shell/app-shell.module.css";
import styles from "./reports.module.css";

export default function ReportsList() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["app-reports"],
    queryFn: listReports,
  });
  return (
    <section className={`${shell.sheet} ${styles.list}`}>
      <ListHeader type="reports" />
      {isLoading && <p role="status">Loading reports…</p>}
      {isError && (
        <p role="alert">
          Could not load reports.{" "}
          <button onClick={() => refetch()}>Try again</button>
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
