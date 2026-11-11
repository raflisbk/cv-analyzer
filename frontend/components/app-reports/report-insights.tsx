import type { ReportsData } from "@/lib/app-api/reports.types";
import DimensionBars from "./dimension-bars";
import insightStyles from "./report-insights.module.css";

export default function ReportInsights({
  aggregate,
}: {
  aggregate: ReportsData["aggregate"];
}) {
  return (
    <div className={insightStyles.insights}>
      <section>
        <h2>Recurring fixes across your CVs</h2>
        {aggregate.recurringFixes.map((fix) => (
          <div className={insightStyles.fix} key={fix.dimension}>
            <strong>
              {fix.dimension} · {fix.cvCount} CVs
            </strong>
            <span>{fix.text}</span>
          </div>
        ))}
      </section>
      <section>
        <h2>Average by dimension</h2>
        <DimensionBars values={aggregate.averageByDimension} />
      </section>
    </div>
  );
}
