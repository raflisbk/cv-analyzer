export function ReportHistoryGrid({ width }: { width: number }) {
  return (
    <>
      {[25, 50, 75, 100].map((score) => (
        <g key={score}>
          <line
            x1="60"
            x2={width - 20}
            y1={180 - score * 1.4}
            y2={180 - score * 1.4}
            stroke="#f3dcd5"
          />
          <text x="48" y={185 - score * 1.4} textAnchor="end" fontSize="12">
            {score}
          </text>
        </g>
      ))}
    </>
  );
}
