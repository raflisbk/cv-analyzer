interface IconProps {
  className?: string;
  size?: number;
}

/**
 * AI Scoring — circular gauge/dial with bold needle + AI sparkle.
 * Communicates: automated quality scoring / measurement.
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
      {/* Outer dial ring (partial arc, 240° — like a speedometer) */}
      <path
        d="M 4.5 19 A 9 9 0 1 1 19.5 19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.25"
      />
      {/* Active arc (filled portion — high score) */}
      <path
        d="M 4.5 19 A 9 9 0 0 1 18.4 8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Bold needle pointing upper-right (good score) */}
      <path d="M12 12 L18 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Center pivot dot */}
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      {/* AI sparkle — top left */}
      <path
        d="M4 4 L4.6 5.5 L6 4.8 L4.8 6 L6 7.2 L4.6 6.5 L4 8 L3.4 6.5 L2 7.2 L3.2 6 L2 4.8 L3.4 5.5 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Skill Gap Analysis — two bars: current (short + arrow) vs target (tall).
 * A dashed target line shows the gap to close.
 * Communicates: where you are vs where you need to be.
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
      {/* Target line (dashed — the goal) */}
      <path d="M2 5 L22 5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" strokeLinecap="round" strokeOpacity="0.5" />
      {/* Current skills bar (short — has a gap to the target line) */}
      <rect x="4" y="13" width="6" height="9" rx="1.5" fill="currentColor" />
      {/* Target / required skills bar (reaches the target line) */}
      <rect x="14" y="5.5" width="6" height="16.5" rx="1.5" fill="currentColor" fillOpacity="0.3" />
      {/* Upward arrow on the short bar (close the gap!) */}
      <path d="M7 12.5 L7 7 M5 9 L7 7 L9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Job Match Comparison — two overlapping document cards + checkmark match badge.
 * Communicates: comparing your CV against a job description to find match %.
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
      {/* Card 1 — your CV (slightly behind, left) */}
      <rect x="1" y="5" width="13" height="16" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" />
      <rect x="3.5" y="9" width="7" height="1.2" rx="0.6" fill="currentColor" fillOpacity="0.5" />
      <rect x="3.5" y="12" width="5.5" height="1.2" rx="0.6" fill="currentColor" fillOpacity="0.35" />
      {/* Card 2 — job description (slightly in front, right) */}
      <rect x="10" y="3" width="13" height="16" rx="2" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
      <rect x="12.5" y="7" width="7" height="1.2" rx="0.6" fill="currentColor" fillOpacity="0.65" />
      <rect x="12.5" y="10" width="5" height="1.2" rx="0.6" fill="currentColor" fillOpacity="0.45" />
      <rect x="12.5" y="13" width="3.5" height="1.2" rx="0.6" fill="currentColor" fillOpacity="0.3" />
      {/* Match badge — overlapping bottom center */}
      <circle cx="16" cy="19" r="4.5" fill="currentColor" />
      <path d="M13.8 19 L15.5 20.8 L18.8 17" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
