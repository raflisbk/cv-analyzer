import { useT } from "@/components/i18n/i18n-provider";
import styles from "./report.module.css";

export function ScoreRing({
  score,
  large = false,
}: {
  score: number;
  large?: boolean;
}) {
  const { t } = useT();
  const radius = large ? 70 : 34;
  const center = large ? 88 : 44;
  const size = center * 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className={`${styles.ring} ${large ? styles.ringLarge : ""}`}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={t("appReport.overall.ringLabel", { score })}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={large ? "var(--app-ring-track)" : "var(--app-line-soft)"}
          strokeWidth={large ? 18 : 10}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={large ? "#f2ff00" : "#f42902"}
          strokeWidth={large ? 18 : 10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <strong>{score}</strong>
      {large && <small>{t("appReport.overall.ofHundred")}</small>}
    </div>
  );
}
