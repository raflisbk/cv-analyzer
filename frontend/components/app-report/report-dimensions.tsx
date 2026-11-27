import { useT } from "@/components/i18n/i18n-provider";
import { reportHint, reportMetric } from "@/lib/app-report/copy";
import { useAppReportFormat } from "@/hooks/use-app-report-format";
import type { ReportDimension } from "@/lib/app-api/report-detail.types";
import { reportWeights } from "@/lib/app-report/format";
import { ReportHeading } from "./report-heading";
import { ScoreRing } from "./score-ring";
import { ReportDimensionEvidence } from "./report-dimension-evidence";
import styles from "./report.module.css";

export function ReportDimensions({
  dimensions,
  fixHref,
}: {
  dimensions: ReportDimension[];
  fixHref: string;
}) {
  const { t } = useT();
  const { delta } = useAppReportFormat();
  return (
    <>
      {dimensions.map((dimension, index) => (
        <section
          key={dimension.key}
          className={`${styles.card} ${styles.span3}`}
          id={index === 0 ? "report-scores" : undefined}
          aria-label={t("appReport.dimensions.aria", {
            name: t(`appReport.dimensions.${dimension.key}`),
          })}
        >
          <ReportHeading
            title={t("appReport.dimensions.detail")}
            helpKey="dims"
          />
          <div className={styles.dimTop}>
            <ScoreRing score={dimension.score} />
            <div>
              <h2>{t(`appReport.dimensions.${dimension.key}`)}</h2>
              <p>{dimension.description}</p>
            </div>
          </div>
          <div className={styles.metrics}>
            {dimension.metrics.map((metric) => (
              <div className={styles.metric} key={metric.label}>
                <div>
                  <span>{reportMetric(t, metric).label}</span>
                  <em>{reportMetric(t, metric).value}</em>
                </div>
                <span className={styles.track}>
                  <i style={{ width: `${metric.percent}%` }} />
                </span>
              </div>
            ))}
          </div>
          <div className={styles.facts}>
            <span>
              {t("appReport.dimensions.weight", {
                percent: reportWeights[dimension.key],
              })}
            </span>
            <span>
              {t("appReport.dimensions.vsPrevious", {
                delta: delta(dimension.score - dimension.previous),
              })}
            </span>
          </div>
          <p className={styles.caption}>
            {t("appReport.dimensions.drag", { hint: reportHint(t, dimension) })}
          </p>
          <ReportDimensionEvidence
            evidence={dimension.evidence}
            fixHref={fixHref}
          />
        </section>
      ))}
    </>
  );
}
