interface IconProps {
  className?: string;
  size?: number;
}

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
      <rect x="4.5" y="4.5" width="14" height="18" rx="3" fill="#141414" opacity="0.18" />
      <rect x="3" y="3" width="14" height="18" rx="3" fill="#F5F2D8" stroke="#141414" strokeWidth="2.2" />
      <rect x="6" y="8"  width="8" height="1.8" rx="0.9" fill="#141414" opacity="0.35" />
      <rect x="6" y="12" width="6" height="1.8" rx="0.9" fill="#141414" opacity="0.25" />
      <rect x="6" y="16" width="4" height="1.8" rx="0.9" fill="#141414" opacity="0.2"  />
      <rect x="18.5" y="3.5" width="7" height="19" rx="2" fill="#141414" opacity="0.18" />
      <rect x="17" y="2" width="7" height="18" rx="2" fill="#FF8C42" stroke="#141414" strokeWidth="2.2" />
      <rect x="17" y="2" width="7" height="4.5" rx="2" fill="#F5F2D8" />
      <rect x="17" y="6.5" width="7" height="2" fill="#141414" opacity="0.45" />
      <polygon
        points="17,20 24,20 20.5,26"
        fill="#F5F2D8"
        stroke="#141414"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="20.5" cy="25.5" r="1" fill="#141414" opacity="0.5" />
    </svg>
  );
}

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
      <rect x="2.5" y="2.5" width="15" height="19" rx="3" fill="#141414" opacity="0.18" />
      <rect x="1" y="1" width="15" height="19" rx="3" fill="#F5F2D8" stroke="#141414" strokeWidth="2.2" />
      <rect x="4"  y="6"  width="9" height="1.8" rx="0.9" fill="#141414" opacity="0.35" />
      <rect x="4"  y="10" width="7" height="1.8" rx="0.9" fill="#141414" opacity="0.25" />
      <rect x="4"  y="14" width="5" height="1.8" rx="0.9" fill="#141414" opacity="0.2"  />
      <circle cx="18.5" cy="17.5" r="7.5" fill="#141414" opacity="0.18" />
      <circle cx="17" cy="16" r="7.5" fill="#CAFF43" stroke="#141414" strokeWidth="2.5" />
      <line x1="13" y1="16" x2="21" y2="16" stroke="#141414" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
      <line x1="17" y1="12" x2="17" y2="20" stroke="#141414" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
      <line x1="22.5" y1="21.5" x2="27" y2="26.5" stroke="#141414" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

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
      <rect x="2.5" y="12.5" width="24" height="15" rx="3.5" fill="#141414" opacity="0.18" />
      <rect x="1" y="11" width="24" height="15" rx="3.5" fill="#8B5CF6" stroke="#141414" strokeWidth="2.5" />
      <path
        d="M9 11 V8 A5 5 0 0 1 19 8 V11"
        stroke="#141414"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="1" y="17.5" width="24" height="2.5" fill="#141414" opacity="0.25" />
      <circle cx="13" cy="18.8" r="3" fill="#CAFF43" stroke="#141414" strokeWidth="2" />
      <circle cx="13" cy="18.8" r="1" fill="#141414" opacity="0.5" />
    </svg>
  );
}

