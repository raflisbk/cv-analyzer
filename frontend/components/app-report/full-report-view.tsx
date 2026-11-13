"use client";

import { useState } from "react";
import ExportDialog from "@/components/app-export/export-dialog";
import { useAppReportDetail } from "@/hooks/use-app-report-detail";
import { ReportLoadState } from "./report-load-state";
import { ReportToolbar } from "./report-toolbar";
import { ReportNav } from "./report-nav";
import { ReportHero } from "./report-hero";
import { ReportOverallCard } from "./report-overall-card";
import { ReportRadarCard } from "./report-radar-card";
import { ReportFixesCard } from "./report-fixes-card";
import { ReportDimensions } from "./report-dimensions";
import { ReportSections } from "./report-sections";
import { ReportBulletStrength } from "./report-bullet-strength";
import { ReportGrammar } from "./report-grammar";
import { ReportBullets } from "./report-bullets";
import { ReportKeywords } from "./report-keywords";
import { ReportAts } from "./report-ats";
import { ReportHistory } from "./report-history";
import styles from "./report.module.css";

export default function FullReportView({ jobId }: { jobId: string }) {
  const { data, isPending, isError, refetch } = useAppReportDetail(jobId);
  const [exportOpen, setExportOpen] = useState(false);
  const fixHref = `/app/cvs/${encodeURIComponent(jobId)}?view=editor&tab=fixes`;
  if (isPending) {
    return <ReportLoadState kind="loading" />;
  }
  if (isError) {
    return <ReportLoadState kind="error" retry={() => refetch()} />;
  }
  if (!data || !data.dimensions.length) {
    return <ReportLoadState kind="empty" />;
  }
  return (
    <div className={styles.report} data-job-id={jobId}>
      <ReportToolbar
        data={data}
        jobId={jobId}
        onExport={() => setExportOpen(true)}
      />
      <ReportNav />
      <div className={styles.grid}>
        <ReportHero
          data={data}
          fixHref={fixHref}
          onExport={() => setExportOpen(true)}
        />
        <ReportOverallCard data={data} />
        <ReportRadarCard data={data} />
        <ReportFixesCard data={data} fixHref={fixHref} />
        <ReportDimensions dimensions={data.dimensions} fixHref={fixHref} />
        <ReportSections sections={data.sections} />
        <ReportBulletStrength bullets={data.bullets} />
        <ReportGrammar grammar={data.grammar} />
        <ReportBullets bullets={data.bullets} fixHref={fixHref} />
        <ReportKeywords keywords={data.keywords} fixHref={fixHref} />
        <ReportAts ats={data.ats} />
        <ReportHistory
          versions={data.versions}
          projectedScore={data.projectedScore}
        />
      </div>
      <ExportDialog
        jobId={jobId}
        open={exportOpen}
        onClose={() => setExportOpen(false)}
      />
    </div>
  );
}
