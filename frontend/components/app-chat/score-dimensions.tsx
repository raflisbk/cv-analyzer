"use client";

import type { CSSProperties } from "react";
import { useT } from "@/components/i18n/i18n-provider";
import type { ReportDimension } from "@/lib/app-api/report-detail.types";
import styles from "./score.module.css";

export default function ScoreDimensions({
  dimensions,
}: {
  dimensions: ReportDimension[];
}) {
  const { t } = useT();
  return (
    <dl className={styles.dims}>
      {dimensions.map(({ key, score }) => (
        <div key={key}>
          <dt>{t(`app.reports.${key}`)}</dt>
          <dd>
            <i
              style={{ "--v": `${score}%` } as CSSProperties}
              aria-hidden="true"
            />
            <span>{score}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
