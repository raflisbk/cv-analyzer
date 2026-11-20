"use client";

import { useT } from "@/components/i18n/i18n-provider";
import type { ReportsData } from "@/lib/app-api/reports.types";
import DimensionBars from "./dimension-bars";
import insightStyles from "./report-insights.module.css";

export default function ReportInsights({
  aggregate,
}: {
  aggregate: ReportsData["aggregate"];
}) {
  const { t } = useT();
  return (
    <div className={insightStyles.insights}>
      <section>
        <h2>{t("app.reports.recurring")}</h2>
        {aggregate.recurringFixes.map((fix) => (
          <div className={insightStyles.fix} key={fix.dimension}>
            <strong>
              {fix.dimension} ·{" "}
              {t("app.reports.cvCount", { count: fix.cvCount })}
            </strong>
            <span>{fix.text}</span>
          </div>
        ))}
      </section>
      <section>
        <h2>{t("app.reports.averageByDimension")}</h2>
        <DimensionBars values={aggregate.averageByDimension} />
      </section>
    </div>
  );
}
