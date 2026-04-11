interface IconProps {
  className?: string;
  size?: number;
}

/**
 * AI Scoring — star/sparkle in a rounded square (sticker style).
 * Bold lime rounded-square bg, dark 4-point star = scoring achievement.
 */
export function AIScoringIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Drop shadow */}
      <rect x="2.5" y="2.5" width="20" height="20" rx="6" fill="#141414" opacity="0.18" />
      {/* Lime rounded square */}
      <rect x="1" y="1" width="20" height="20" rx="6" fill="#CAFF43" stroke="#141414" strokeWidth="2.2" />
      {/* 4-point star = scoring / AI spark */}
      <path
        d="M11 4 L12.2 9.8 L18 11 L12.2 12.2 L11 18 L9.8 12.2 L4 11 L9.8 9.8 Z"
        fill="#141414"
      />
    </svg>
  );
}

/**
 * Skill Gap Analysis — upward arrow with gap bars (sticker style).
 * Pink rounded-square bg, dark progress bars with gap = level-up read.
 */
export function SkillGapIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Drop shadow */}
      <rect x="2.5" y="2.5" width="20" height="20" rx="6" fill="#141414" opacity="0.18" />
      {/* Pink rounded square */}
      <rect x="1" y="1" width="20" height="20" rx="6" fill="#FF4FCB" stroke="#141414" strokeWidth="2.2" />
      {/* Bar 1 — short, cream */}
      <rect x="4.5" y="14" width="3.5" height="5" rx="1" fill="#F5F2D8" opacity="0.7" />
      {/* Bar 2 — medium, cream */}
      <rect x="10.3" y="10" width="3.5" height="9" rx="1" fill="#F5F2D8" opacity="0.85" />
      {/* Bar 3 — tall, bright white (the goal) */}
      <rect x="16" y="5.5" width="3.5" height="13.5" rx="1" fill="#F5F2D8" />
      {/* Upward arrow on top of tall bar */}
      <path
        d="M17.75 5 L19.3 7.5 L16.2 7.5 Z"
        fill="#141414"
        opacity="0.6"
      />
    </svg>
  );
}

/**
 * Job Match Comparison — two linked circles (sticker style).
 * Orange rounded-square bg, Venn-diagram overlap = match/comparison.
 */
export function JobMatchIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Drop shadow */}
      <rect x="2.5" y="2.5" width="20" height="20" rx="6" fill="#141414" opacity="0.18" />
      {/* Orange rounded square */}
      <rect x="1" y="1" width="20" height="20" rx="6" fill="#FF8C42" stroke="#141414" strokeWidth="2.2" />
      {/* Left circle */}
      <circle cx="8.5" cy="11" r="4.5" fill="#F5F2D8" opacity="0.7" />
      {/* Right circle */}
      <circle cx="13.5" cy="11" r="4.5" fill="#F5F2D8" opacity="0.7" />
      {/* Overlap highlight */}
      <path
        d="M11 7.5 A4.5 4.5 0 0 1 11 14.5 A4.5 4.5 0 0 1 11 7.5 Z"
        fill="#F5F2D8"
        opacity="0.6"
      />
      {/* Check in overlap */}
      <path
        d="M9.8 11 L11 12.2 L13.2 9.8"
        stroke="#141414"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

