interface IconProps {
  className?: string;
  size?: number;
}

/**
 * CV Builder — bold horizontal pencil (brand stamp style).
 * Full filled shape: eraser cap + body + triangle tip + highlight stripe.
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
      {/* Pencil body */}
      <rect x="4" y="10" width="16" height="8" rx="1.5" fill="currentColor" />
      {/* Eraser cap — left end */}
      <rect x="2" y="11" width="4" height="6" rx="1" fill="currentColor" fillOpacity="0.5" />
      {/* Eraser divider */}
      <rect x="5.5" y="10" width="1" height="8" fill="white" fillOpacity="0.35" />
      {/* Pencil tip — right triangle */}
      <path d="M20 10 L20 18 L25 14 Z" fill="currentColor" />
      {/* Body highlight stripe */}
      <rect x="4" y="13.5" width="16" height="1.5" rx="0.75" fill="white" fillOpacity="0.25" />
    </svg>
  );
}

/**
 * CV Analyzer — three rising score bars + 4-pt diamond sparkle.
 * Bold filled shapes: tallest bar full opacity, others stepped.
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
      {/* Bar 1 — short */}
      <rect x="2" y="19" width="6" height="7" rx="1.5" fill="currentColor" fillOpacity="0.45" />
      {/* Bar 2 — medium */}
      <rect x="11" y="12" width="6" height="14" rx="1.5" fill="currentColor" fillOpacity="0.7" />
      {/* Bar 3 — tall (full) */}
      <rect x="20" y="5" width="6" height="21" rx="1.5" fill="currentColor" />
      {/* 4-pt diamond sparkle above tallest bar */}
      <path
        d="M23 1 L24.2 3 L26 1.8 L24.2 4 L26 6.2 L24.2 4.8 L23 7 L21.8 4.8 L20 6.2 L21.8 4 L20 1.8 L21.8 3 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Job Finding — bold location pin with white upward arrow inside.
 * Filled pin (circle head + teardrop tail) + white negative-space arrow.
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
      {/* Pin head (large filled circle) */}
      <circle cx="14" cy="11" r="9" fill="currentColor" />
      {/* Pin tail (filled teardrop drip) */}
      <path d="M10.5 17.5 L14 26 L17.5 17.5" fill="currentColor" />
      {/* White upward arrow inside circle (negative space) */}
      <path
        d="M14 15.5 L14 7.5 M11 10.5 L14 7.5 L17 10.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

