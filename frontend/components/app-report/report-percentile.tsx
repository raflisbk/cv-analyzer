export function ReportPercentile({ topPercent }: { topPercent: number }) {
  const x = 300 * (1 - topPercent / 100);
  return (
    <svg
      viewBox="0 0 300 56"
      role="img"
      aria-label={`Top ${topPercent} percent for this role`}
      style={{ width: "100%", height: "auto" }}
    >
      <path
        d="M0 52 C60 52 90 8 150 8 S240 52 300 52Z"
        fill="rgba(253,253,255,.18)"
      />
      <path
        d={`M${x} 52 L${x} 24 C240 42 260 52 300 52Z`}
        fill="rgba(242,255,0,.55)"
      />
      <line x1={x} y1="6" x2={x} y2="52" stroke="#f2ff00" strokeWidth="3" />
      <circle cx={x} cy="6" r="5" fill="#f2ff00" />
      <text
        x={Math.min(x + 8, 270)}
        y="14"
        fill="#fdfdff"
        fontSize="11"
        fontWeight="800"
      >
        you
      </text>
    </svg>
  );
}
