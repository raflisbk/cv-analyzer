import styles from "./report.module.css";

export function ScoreRing({
  score,
  large = false,
}: {
  score: number;
  large?: boolean;
}) {
  const radius = large ? 70 : 34;
  const center = large ? 88 : 44;
  const size = center * 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className={`${styles.ring} ${large ? styles.ringLarge : ""}`}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${score} out of 100`}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={large ? "rgba(26,11,7,.35)" : "#f3dcd5"}
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
      {large && <small>of 100</small>}
    </div>
  );
}
