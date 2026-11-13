import type { ReportDimension } from "@/lib/app-api/report-detail.types";
import { formatDelta, reportWeights } from "@/lib/app-report/format";
import { ReportHeading } from "./report-heading";
import { ScoreRing } from "./score-ring";
import styles from "./report.module.css";

export function ReportDimensions({
  dimensions,
  fixHref,
}: {
  dimensions: ReportDimension[];
  fixHref: string;
}) {
  return (
    <>
      {dimensions.map((dimension, index) => (
        <section
          key={dimension.key}
          className={`${styles.card} ${styles.span3}`}
          id={index === 0 ? "report-scores" : undefined}
          aria-label={`${dimension.key} score`}
        >
          <ReportHeading title="Score detail" helpKey="dims" />
          <div className={styles.dimTop}>
            <ScoreRing score={dimension.score} />
            <div>
              <h2>{dimension.key[0].toUpperCase() + dimension.key.slice(1)}</h2>
              <p>{dimension.description}</p>
            </div>
          </div>
          <div className={styles.metrics}>
            {dimension.metrics.map((metric) => (
              <div className={styles.metric} key={metric.label}>
                <div>
                  <span>{metric.label}</span>
                  <em>{metric.value}</em>
                </div>
                <span className={styles.track}>
                  <i style={{ width: `${metric.percent}%` }} />
                </span>
              </div>
            ))}
          </div>
          <div className={styles.facts}>
            <span>{reportWeights[dimension.key]}% of the score</span>
            <span>
              {formatDelta(dimension.score - dimension.previous)} vs previous
            </span>
          </div>
          <p className={styles.caption}>Biggest drag: {dimension.hint}</p>
          <details className={styles.evidence}>
            <summary>Evidence · {dimension.evidence.length}</summary>
            <ul>
              {dimension.evidence.map((item) => (
                <li key={item.text} data-positive={item.positive}>
                  <div>
                    {item.text}
                    <small>{item.note}</small>
                  </div>
                  <a className={styles.mini} href={fixHref}>
                    Fix this
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </section>
      ))}
    </>
  );
}
