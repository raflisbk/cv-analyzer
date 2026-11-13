"use client";

import { useAppReportScoreReveal } from "@/hooks/use-app-report-score-reveal";
import type { ReportDetail } from "@/lib/app-api/report-detail.types";
import { USE_APP_MOCKS } from "@/lib/app-api/mode";
import { formatDelta } from "@/lib/app-report/format";
import { ReportHeading } from "./report-heading";
import { ScoreRing } from "./score-ring";
import { ReportPercentile } from "./report-percentile";
import styles from "./report.module.css";

export function ReportOverallCard({ data }: { data: ReportDetail }) {
  const shown = useAppReportScoreReveal(data.score);
  return (
    <section
      className={`${styles.card} ${styles.deep} ${styles.span4}`}
      data-tour="report-scores"
    >
      <ReportHeading
        title={`Overall score${USE_APP_MOCKS ? " · sample" : ""}`}
        helpKey="overall"
      />
      <ScoreRing score={shown} large />
      <p>Clarity carries the score. Impact holds it back.</p>
      <ReportPercentile topPercent={data.topPercent} />
      <div className={styles.facts}>
        {data.facts.map((fact) => (
          <span key={fact}>{fact}</span>
        ))}
      </div>
      <p className={styles.caption}>
        Scoring v5 · weighted across four dimensions.
      </p>
      <div className={styles.facts}>
        <span>
          {formatDelta(data.score - data.previousScore)} vs{" "}
          {data.versions[0]?.label}
        </span>
        <span>
          Top {data.topPercent}% of {data.role} CVs
        </span>
      </div>
    </section>
  );
}
