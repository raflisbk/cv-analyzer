interface IconProps {
  className?: string;
  size?: number;
}

/**
 * CV Builder — diagonal pencil (sticker style).
 * Bold lime body, cream eraser, dark tip + thick outline.
 */
export function CVBuilderIcon({ className, size = 28 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g transform="rotate(45, 14, 14)">
        {/* Full pencil outline — lime body */}
        <path
          d="M 12 2 L 16 2 A 2 2 0 0 1 18 4 L 18 20 L 14 26 L 10 20 L 10 4 A 2 2 0 0 1 12 2 Z"
          fill="#CAFF43"
          stroke="#141414"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Eraser cap — cream, no stroke (outer stroke covers edge) */}
        <rect x="10" y="2" width="8" height="5" fill="#F5F2D8" />
        {/* Metal band — dark semi-transparent */}
        <rect x="10" y="7" width="8" height="2.5" fill="#141414" opacity="0.3" />
        {/* Pencil tip — dark triangle */}
        <polygon points="10,20 18,20 14,26" fill="#141414" opacity="0.5" />
      </g>
    </svg>
  );
}

/**
 * CV Analyzer — bold magnifying glass (sticker style).
 * Large lime lens with CV text lines inside + fat dark handle.
 */
export function CVAnalyzerIcon({ className, size = 28 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Lens circle — lime fill, bold dark outline */}
      <circle cx="11" cy="11" r="8.5" fill="#CAFF43" stroke="#141414" strokeWidth="2.5" />
      {/* CV content lines visible through lens */}
      <rect x="6.5" y="8" width="9" height="2" rx="1" fill="#141414" opacity="0.7" />
      <rect x="6.5" y="11.5" width="7" height="2" rx="1" fill="#141414" opacity="0.5" />
      <rect x="6.5" y="15" width="4.5" height="2" rx="1" fill="#141414" opacity="0.35" />
      {/* Handle — fat, bold, dark */}
      <path d="M17.5 18 L26 26.5" stroke="#141414" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Job Finding — location pin (sticker style).
 * Lime teardrop pin, cream inner circle = classic map marker.
 */
export function JobFindingIcon({ className, size = 28 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Pin teardrop — lime, bold dark outline */}
      <path
        d="M 5 12 A 9 9 0 1 1 23 12 L 14 27 Z"
        fill="#CAFF43"
        stroke="#141414"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Inner circle — cream hole = classic map pin look */}
      <circle cx="14" cy="11" r="4" fill="#F5F2D8" stroke="#141414" strokeWidth="2" />
    </svg>
  );
}

