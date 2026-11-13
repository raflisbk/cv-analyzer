import type { ReportDetail } from "@/lib/app-api/report-detail.types";
import styles from "./report.module.css";

export function ReportHistoryChart({
  versions,
  projectedScore,
}: {
  versions: ReportDetail["versions"];
  projectedScore: number;
}) {
  const values = [...versions.map((version) => version.score), projectedScore];
  const point = (score: number, index: number) =>
    `${150 + index * 300},${180 - score * 1.4}`;
  return (
    <svg
      className={styles.history}
      viewBox="0 0 900 220"
      role="img"
      aria-label={`Score by version: ${versions.map((version) => `${version.label} ${version.score}`).join(", ")}; projected ${projectedScore}`}
    >
      {[25, 50, 75, 100].map((score) => (
        <g key={score}>
          <line
            x1="60"
            x2="880"
            y1={180 - score * 1.4}
            y2={180 - score * 1.4}
            stroke="#f3dcd5"
          />
          <text x="48" y={185 - score * 1.4} textAnchor="end" fontSize="12">
            {score}
          </text>
        </g>
      ))}
      <polyline
        points={versions
          .map((version, index) => point(version.score, index))
          .join(" ")}
        fill="none"
        stroke="#f42902"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {versions.length > 0 && (
        <line
          x1={150 + (versions.length - 1) * 300}
          y1={180 - versions[versions.length - 1].score * 1.4}
          x2={150 + versions.length * 300}
          y2={180 - projectedScore * 1.4}
          stroke="#f42902"
          strokeWidth="5"
          strokeDasharray="3 12"
        />
      )}
      {values.map((score, index) => (
        <g key={index}>
          <circle
            cx={150 + index * 300}
            cy={180 - score * 1.4}
            r="9"
            fill={index === values.length - 1 ? "#f2ff00" : "#f42902"}
          />
          <text
            x={150 + index * 300}
            y={160 - score * 1.4}
            textAnchor="middle"
            fontWeight="800"
            fontSize="14"
          >
            {score}
            {index === values.length - 1 ? " if fixed" : ""}
          </text>
          <text x={150 + index * 300} y="207" textAnchor="middle" fontSize="12">
            {index === values.length - 1
              ? "after fixes"
              : versions[index].label}
          </text>
        </g>
      ))}
    </svg>
  );
}
