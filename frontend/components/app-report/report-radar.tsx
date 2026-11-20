"use client";

import { useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";
import type { ReportDimension } from "@/lib/app-api/report-detail.types";
import { ReportRadarLegend } from "./report-radar-legend";
import styles from "./report.module.css";

export function ReportRadar({
  dimensions,
  hasPrevious = true,
}: {
  dimensions: ReportDimension[];
  hasPrevious?: boolean;
}) {
  const [showPrevious, setShowPrevious] = useState(true);
  const { t } = useT();
  const points = (values: number[]) =>
    values
      .map((value, index) => {
        const angle = (index * Math.PI) / 2 - Math.PI / 2;
        return `${110 + Math.cos(angle) * value * 0.8},${110 + Math.sin(angle) * value * 0.8}`;
      })
      .join(" ");
  return (
    <>
      <svg
        className={styles.radar}
        viewBox="-18 -12 256 244"
        role="img"
        aria-label={t("appReport.radar.label", {
          list: dimensions
            .map(
              (item) =>
                `${t(`appReport.dimensions.${item.key}`)} ${item.score}`,
            )
            .join(", "),
        })}
      >
        {[25, 50, 75, 100].map((value) => (
          <polygon
            key={value}
            points={points([value, value, value, value])}
            fill="none"
            stroke="#e9c9c0"
          />
        ))}
        {hasPrevious && showPrevious && dimensions.length === 4 && (
          <polygon
            points={points(dimensions.map((item) => item.previous))}
            fill="none"
            stroke="#1a0b07"
            strokeWidth="2"
            strokeDasharray="6 5"
          />
        )}
        {hasPrevious && dimensions.length === 4 && (
          <polygon
            points={points(dimensions.map((item) => item.score))}
            fill="rgba(244,41,2,.28)"
            stroke="#f42902"
            strokeWidth="3"
          />
        )}
        {dimensions.map((item, index) => (
          <text
            key={item.key}
            x={[110, 205, 110, 15][index]}
            y={[10, 115, 224, 115][index]}
            textAnchor="middle"
            fontSize="11"
            fontWeight="800"
            fill="#5a2a20"
          >
            {t(`appReport.dimensions.${item.key}`)} {item.score}
          </text>
        ))}
      </svg>
      <ReportRadarLegend
        showPrevious={showPrevious}
        togglePrevious={() => setShowPrevious(!showPrevious)}
        canCompare={dimensions.length === 4}
      />
    </>
  );
}
