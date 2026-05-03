interface IconProps {
  className?: string;
  size?: number;
}

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
      <rect x="2.5" y="2.5" width="20" height="20" rx="6" fill="#141414" opacity="0.18" />
      <rect x="1" y="1" width="20" height="20" rx="6" fill="#CAFF43" stroke="#141414" strokeWidth="2.2" />
      <path
        d="M11 4 L12.2 9.8 L18 11 L12.2 12.2 L11 18 L9.8 12.2 L4 11 L9.8 9.8 Z"
        fill="#141414"
      />
    </svg>
  );
}

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
      <rect x="2.5" y="2.5" width="20" height="20" rx="6" fill="#141414" opacity="0.18" />
      <rect x="1" y="1" width="20" height="20" rx="6" fill="#FF4FCB" stroke="#141414" strokeWidth="2.2" />
      <rect x="4.5" y="14" width="3.5" height="5" rx="1" fill="#F5F2D8" opacity="0.7" />
      <rect x="10.3" y="10" width="3.5" height="9" rx="1" fill="#F5F2D8" opacity="0.85" />
      <rect x="16" y="5.5" width="3.5" height="13.5" rx="1" fill="#F5F2D8" />
      <path
        d="M17.75 5 L19.3 7.5 L16.2 7.5 Z"
        fill="#141414"
        opacity="0.6"
      />
    </svg>
  );
}

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
      <rect x="2.5" y="2.5" width="20" height="20" rx="6" fill="#141414" opacity="0.18" />
      <rect x="1" y="1" width="20" height="20" rx="6" fill="#FF8C42" stroke="#141414" strokeWidth="2.2" />
      <circle cx="8.5" cy="11" r="4.5" fill="#F5F2D8" opacity="0.7" />
      <circle cx="13.5" cy="11" r="4.5" fill="#F5F2D8" opacity="0.7" />
      <path
        d="M11 7.5 A4.5 4.5 0 0 1 11 14.5 A4.5 4.5 0 0 1 11 7.5 Z"
        fill="#F5F2D8"
        opacity="0.6"
      />
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

