import styles from "./report.module.css";

export function ReportBulletDonut({
  counts,
}: {
  counts: { strong: number; fair: number; weak: number };
}) {
  const total = counts.strong + counts.fair + counts.weak || 1;
  const length = 2 * Math.PI * 52;
  return (
    <svg
      className={styles.donut}
      viewBox="0 0 140 140"
      role="img"
      aria-label={`${counts.strong} strong, ${counts.fair} fair, ${counts.weak} weak bullets`}
    >
      <circle
        cx="70"
        cy="70"
        r="52"
        fill="none"
        stroke="#f3dcd5"
        strokeWidth="22"
      />
      {(["strong", "fair", "weak"] as const).map((kind, index) => (
        <circle
          key={kind}
          cx="70"
          cy="70"
          r="52"
          fill="none"
          stroke={{ strong: "#f2ff00", fair: "#f42902", weak: "#1a0b07" }[kind]}
          strokeWidth="22"
          strokeDasharray={`${(length * counts[kind]) / total} ${length}`}
          strokeDashoffset={
            (-length *
              (index === 0
                ? 0
                : index === 1
                  ? counts.strong
                  : counts.strong + counts.fair)) /
            total
          }
          transform="rotate(-90 70 70)"
        />
      ))}
      <text x="70" y="68" textAnchor="middle" fontSize="32" fontWeight="800">
        {total}
      </text>
      <text x="70" y="86" textAnchor="middle" fontSize="12">
        bullets
      </text>
    </svg>
  );
}
