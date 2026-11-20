"use client";

import { useT } from "@/components/i18n/i18n-provider";
import type { Dimensions } from "@/lib/app-api/reports.types";
import styles from "./reports.module.css";

export default function DimensionBars({ values }: { values: Dimensions }) {
  const { t } = useT();
  return (
    <div className={styles.bars}>
      {(Object.entries(values) as [keyof Dimensions, number][]).map(
        ([key, score]) => (
          <div key={key} className={styles.bar}>
            <div>
              <span>{t(`app.reports.${key}`)}</span>
              <span>{score}</span>
            </div>
            <b>
              <i data-low={key === "impact"} style={{ width: `${score}%` }} />
            </b>
          </div>
        ),
      )}
    </div>
  );
}
