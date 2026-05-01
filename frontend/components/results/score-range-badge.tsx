interface ScoreRangeBadgeProps {
  score: number;
}

function getScoreLabel(score: number): string {
  if (score >= 80) { return "Good"; }
  if (score >= 60) { return "Average"; }
  return "Needs Work";
}

function getScoreClasses(score: number): string {
  if (score >= 80) { return "bg-[#CAFF43]/15 text-[#CAFF43] rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider"; }
  if (score >= 60) { return "bg-[#FF8C42]/15 text-[#FF8C42] rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider"; }
  return "bg-[#FF4FCB]/15 text-[#FF4FCB] rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider";
}

export function ScoreRangeBadge({ score }: ScoreRangeBadgeProps) {
  return (
    <span className={getScoreClasses(score)}>
      {getScoreLabel(score)}
    </span>
  );
}
