interface IconProps {
  className?: string;
  size?: number;
}

/**
 * CV Builder — pen writing bold strokes on a document.
 * Three text-line strokes + diagonal pen body + filled nib tip.
 */
export function CVBuilderIcon({ className, size = 28 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* Three text lines — left-aligned, decreasing length */}
      <path d="M3 7.5 L14 7.5" strokeWidth="2" />
      <path d="M3 12 L12 12" strokeWidth="2" />
      <path d="M3 16.5 L9 16.5" strokeWidth="2" />
      {/* Pen body — diagonal, overlapping bottom-right */}
      <path
        d="M16 3 L21 8 L11.5 17.5 L7 18.5 L8 14 Z"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.15"
      />
      {/* Pen nib — solid filled triangle */}
      <path d="M8 14 L7 18.5 L11.5 17.5 Z" fill="currentColor" stroke="none" />
      {/* Pen cap highlight */}
      <path d="M17 4.5 L20 7.5" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

/**
 * CV Analyzer — magnifying glass scanning a document.
 * Lens circle + 3 scan lines inside + bold handle + 4-pt diamond sparkle.
 */
export function CVAnalyzerIcon({ className, size = 28 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* Magnifying glass circle */}
      <circle
        cx="10.5"
        cy="10.5"
        r="7"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* 3 scan lines inside lens */}
      <path d="M7 9.5 L14 9.5" strokeWidth="1.5" />
      <path d="M7 12 L13 12" strokeWidth="1.5" />
      <path d="M7 14.5 L11 14.5" strokeWidth="1.5" />
      {/* Bold handle */}
      <path d="M16 16 L21 21" strokeWidth="2.5" />
      {/* 4-point diamond sparkle — top right */}
      <path
        d="M20 2.5 L21 4 L22.5 2.5 L21 4.5 L22.5 6.5 L21 5 L20 6.5 L19 5 L17.5 6.5 L19 4.5 L17.5 2.5 L19 4 Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

/**
 * Job Finding — location pin with a bright 4-pt star inside.
 * Teardrop shape + filled star = "find your opportunity."
 */
export function JobFindingIcon({ className, size = 28 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* Pin teardrop */}
      <path
        d="M12 2 C7.5 2 4 5.5 4 10 C4 15.5 12 22 12 22 C12 22 20 15.5 20 10 C20 5.5 16.5 2 12 2 Z"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* 4-point star inside — the "opportunity" */}
      <path
        d="M12 6 L13.2 9.2 L16.5 9.5 L13.8 11.8 L14.7 15 L12 13.2 L9.3 15 L10.2 11.8 L7.5 9.5 L10.8 9.2 Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
