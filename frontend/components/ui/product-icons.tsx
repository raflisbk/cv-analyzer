interface IconProps {
  className?: string;
  size?: number;
}

/**
 * CV Builder — document + pencil (sticker style, shadow depth, orange accent).
 * Cream document behind, orange pencil overlapping from right.
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
      {/* Drop shadow for document */}
      <rect x="4.5" y="4.5" width="14" height="18" rx="3" fill="#141414" opacity="0.18" />
      {/* Document body — cream */}
      <rect x="3" y="3" width="14" height="18" rx="3" fill="#F5F2D8" stroke="#141414" strokeWidth="2.2" />
      {/* Text lines on document */}
      <rect x="6" y="8"  width="8" height="1.8" rx="0.9" fill="#141414" opacity="0.35" />
      <rect x="6" y="12" width="6" height="1.8" rx="0.9" fill="#141414" opacity="0.25" />
      <rect x="6" y="16" width="4" height="1.8" rx="0.9" fill="#141414" opacity="0.2"  />
      {/* Drop shadow for pencil */}
      <rect x="18.5" y="3.5" width="7" height="19" rx="2" fill="#141414" opacity="0.18" />
      {/* Pencil body — orange */}
      <rect x="17" y="2" width="7" height="18" rx="2" fill="#FF8C42" stroke="#141414" strokeWidth="2.2" />
      {/* Eraser — cream */}
      <rect x="17" y="2" width="7" height="4.5" rx="2" fill="#F5F2D8" />
      {/* Metal band */}
      <rect x="17" y="6.5" width="7" height="2" fill="#141414" opacity="0.45" />
      {/* Pencil tip — triangle */}
      <polygon
        points="17,20 24,20 20.5,26"
        fill="#F5F2D8"
        stroke="#141414"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Graphite tip dot */}
      <circle cx="20.5" cy="25.5" r="1" fill="#141414" opacity="0.5" />
    </svg>
  );
}

/**
 * CV Analyzer — document + bold magnifying glass (sticker style).
 * Cream doc behind, large lime glass overlapping from right-bottom.
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
      {/* Drop shadow for document */}
      <rect x="2.5" y="2.5" width="15" height="19" rx="3" fill="#141414" opacity="0.18" />
      {/* Document — cream */}
      <rect x="1" y="1" width="15" height="19" rx="3" fill="#F5F2D8" stroke="#141414" strokeWidth="2.2" />
      {/* Text lines */}
      <rect x="4"  y="6"  width="9" height="1.8" rx="0.9" fill="#141414" opacity="0.35" />
      <rect x="4"  y="10" width="7" height="1.8" rx="0.9" fill="#141414" opacity="0.25" />
      <rect x="4"  y="14" width="5" height="1.8" rx="0.9" fill="#141414" opacity="0.2"  />
      {/* Drop shadow for lens */}
      <circle cx="18.5" cy="17.5" r="7.5" fill="#141414" opacity="0.18" />
      {/* Magnifying glass lens — lime */}
      <circle cx="17" cy="16" r="7.5" fill="#CAFF43" stroke="#141414" strokeWidth="2.5" />
      {/* Cross-lines inside lens = "analyzing" */}
      <line x1="13" y1="16" x2="21" y2="16" stroke="#141414" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
      <line x1="17" y1="12" x2="17" y2="20" stroke="#141414" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
      {/* Handle — fat, bold */}
      <line x1="22.5" y1="21.5" x2="27" y2="26.5" stroke="#141414" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Job Finding — bold purple briefcase with lime search dot (sticker style).
 * Expressive briefcase shape, lime accent clasp = "opportunity found".
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
      {/* Drop shadow for briefcase */}
      <rect x="2.5" y="12.5" width="24" height="15" rx="3.5" fill="#141414" opacity="0.18" />
      {/* Briefcase body — purple */}
      <rect x="1" y="11" width="24" height="15" rx="3.5" fill="#8B5CF6" stroke="#141414" strokeWidth="2.5" />
      {/* Handle arch */}
      <path
        d="M9 11 V8 A5 5 0 0 1 19 8 V11"
        stroke="#141414"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Horizontal center stripe — clasp area */}
      <rect x="1" y="17.5" width="24" height="2.5" fill="#141414" opacity="0.25" />
      {/* Lime clasp circle */}
      <circle cx="13" cy="18.8" r="3" fill="#CAFF43" stroke="#141414" strokeWidth="2" />
      {/* Clasp dot */}
      <circle cx="13" cy="18.8" r="1" fill="#141414" opacity="0.5" />
    </svg>
  );
}


