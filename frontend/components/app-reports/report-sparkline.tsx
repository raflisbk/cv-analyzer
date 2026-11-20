"use client";

import { useT } from "@/components/i18n/i18n-provider";
import styles from "./reports.module.css";

export default function ReportSparkline({
  first,
  last,
}: {
  first: number;
  last: number;
}) {
  const { t } = useT();
  const fromY = 46 - first * 0.4,
    toY = 46 - last * 0.4;
  return (
    <svg
      viewBox="0 0 120 56"
      role="img"
      aria-label={t("app.reports.scoreByVersion")}
      className={styles.spark}
    >
      <polyline
        points={`12,${fromY} 108,${toY}`}
        fill="none"
        stroke="#b81d00"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="12" cy={fromY} r="4" fill="#b81d00" />
      <circle cx="108" cy={toY} r="4" fill="#b81d00" />
    </svg>
  );
}
