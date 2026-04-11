interface IconProps {
  className?: string;
  size?: number;
}

/**
 * CV Builder — blank document template (dashed placeholder lines) + bold "+" create badge.
 * Communicates: you start from scratch and BUILD your CV.
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
      {/* Document body */}
      <rect x="2" y="1" width="18" height="23" rx="2.5" fill="currentColor" fillOpacity="0.12" />
      {/* Fold corner */}
      <path d="M15 1 L20 6 L15 6 Z" fill="currentColor" fillOpacity="0.35" />
      <path d="M2 1 L15 1 L20 6 L20 24 L2 24 Z" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.2" />
      {/* Placeholder dashed lines (blank template — not yet filled) */}
      <path d="M5 10 L14 10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.5 2" strokeLinecap="round" strokeOpacity="0.6" />
      <path d="M5 14 L12 14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.5 2" strokeLinecap="round" strokeOpacity="0.45" />
      <path d="M5 18 L9 18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.5 2" strokeLinecap="round" strokeOpacity="0.3" />
      {/* "+" create badge — overlapping bottom-right */}
      <circle cx="21" cy="21" r="6.5" fill="currentColor" />
      <path d="M18.2 21 L23.8 21 M21 18.2 L21 23.8" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * CV Analyzer — filled document (existing CV) being scanned by a large magnifying glass.
 * Communicates: you UPLOAD your existing CV and it gets analyzed.
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
      {/* Document body (left side — the CV being analyzed) */}
      <rect x="1" y="4" width="14" height="19" rx="2" fill="currentColor" fillOpacity="0.12" />
      <path d="M1 4 L11 4 L15 8 L15 23 L1 23 Z" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.2" />
      <path d="M11 4 L15 8 L11 8 Z" fill="currentColor" fillOpacity="0.3" />
      {/* Filled content lines (existing CV content) */}
      <rect x="3.5" y="11" width="8.5" height="1.5" rx="0.75" fill="currentColor" fillOpacity="0.7" />
      <rect x="3.5" y="15" width="7" height="1.5" rx="0.75" fill="currentColor" fillOpacity="0.5" />
      <rect x="3.5" y="19" width="5" height="1.5" rx="0.75" fill="currentColor" fillOpacity="0.35" />
      {/* Magnifying glass (large, overlapping document from right) */}
      <circle cx="19" cy="13" r="7.5" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
      {/* Lens cross-hairs (scan indicator) */}
      <path d="M15.5 13 L22.5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
      <path d="M19 9.5 L19 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
      {/* Handle */}
      <path d="M24.5 18.5 L27 21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Job Finding — bold briefcase (universally = job) with a small discovery sparkle.
 * Communicates: finding job opportunities.
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
      {/* Handle */}
      <path
        d="M9.5 12 L9.5 8.5 C9.5 6.6 11.5 5 14 5 C16.5 5 18.5 6.6 18.5 8.5 L18.5 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Briefcase body */}
      <rect x="2" y="12" width="24" height="14" rx="3" fill="currentColor" />
      {/* Horizontal strap divider */}
      <rect x="2" y="19" width="24" height="1.5" fill="white" fillOpacity="0.12" />
      {/* Center clasp */}
      <rect x="11.5" y="17" width="5" height="4.5" rx="1.2" fill="white" fillOpacity="0.22" />
      {/* Discovery sparkle (top-right, above briefcase) */}
      <path
        d="M23.5 2 L24.5 4.5 L27 3.5 L24.8 5.5 L27 7.5 L24.5 6.5 L23.5 9 L22.5 6.5 L20 7.5 L22.2 5.5 L20 3.5 L22.5 4.5 Z"
        fill="currentColor"
      />
    </svg>
  );
}


