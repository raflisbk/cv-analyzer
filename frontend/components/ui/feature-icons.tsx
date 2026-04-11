interface IconProps {
  className?: string;
  size?: number;
}

/**
 * AI Scoring — lightning bolt inside a circle (sticker style).
 * Bold lime circle + dark bolt = instant energy / AI power read.
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
      {/* Lime circle — main shape */}
      <circle cx="12" cy="12" r="10" fill="#CAFF43" stroke="#141414" strokeWidth="2.5" />
      {/* Lightning bolt — bold dark fill */}
      <path
        d="M 13.5 3.5 L 8 13 L 12.5 13 L 10.5 20.5 L 17 10.5 L 12 10.5 Z"
        fill="#141414"
      />
    </svg>
  );
}

/**
 * Skill Gap Analysis — three rising bars (sticker style).
 * Dark short + medium bars + tall lime bar = progress / gap to close.
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
      {/* Short bar — dark, 30% opacity */}
      <rect x="2" y="15" width="5.5" height="7" rx="1.5" fill="#141414" opacity="0.4" stroke="#141414" strokeWidth="2" />
      {/* Medium bar — dark, 65% opacity */}
      <rect x="9.25" y="9" width="5.5" height="13" rx="1.5" fill="#141414" opacity="0.65" stroke="#141414" strokeWidth="2" />
      {/* Tall bar — lime (the goal / achievement) */}
      <rect x="16.5" y="2" width="5.5" height="20" rx="1.5" fill="#CAFF43" stroke="#141414" strokeWidth="2" />
    </svg>
  );
}

/**
 * Job Match Comparison — shield + checkmark (sticker style).
 * Lime shield = protection / verified. Bold dark checkmark = match confirmed.
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
      {/* Shield shape — lime fill, dark outline */}
      <path
        d="M 12 2 L 21 6 L 21 13 C 21 18 16.5 21.5 12 23 C 7.5 21.5 3 18 3 13 L 3 6 Z"
        fill="#CAFF43"
        stroke="#141414"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Checkmark — bold, dark */}
      <path
        d="M 7.5 12.5 L 10.5 15.5 L 17 9"
        stroke="#141414"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
