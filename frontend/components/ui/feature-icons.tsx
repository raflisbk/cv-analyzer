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

export function AIChatIcon({ className, size = 24 }: IconProps) {
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
      <rect x="1" y="1" width="20" height="20" rx="6" fill="#8B5CF6" stroke="#141414" strokeWidth="2.2" />
      <rect x="4" y="5" width="14" height="11" rx="2.5" fill="#F5F2D8" opacity="0.9" />
      <circle cx="8" cy="10.5" r="1.2" fill="#141414" opacity="0.6" />
      <circle cx="11" cy="10.5" r="1.2" fill="#141414" opacity="0.6" />
      <circle cx="14" cy="10.5" r="1.2" fill="#141414" opacity="0.6" />
      <path d="M8 16 L6 20 L10 17" fill="#F5F2D8" opacity="0.9" />
    </svg>
  );
}

export function ATSIcon({ className, size = 24 }: IconProps) {
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
      <rect x="1" y="1" width="20" height="20" rx="6" fill="#22D3EE" stroke="#141414" strokeWidth="2.2" />
      <rect x="5" y="4.5" width="12" height="3" rx="1" fill="#F5F2D8" opacity="0.8" />
      <rect x="5" y="9.5" width="8" height="1.5" rx="0.75" fill="#F5F2D8" opacity="0.5" />
      <rect x="5" y="12.5" width="10" height="1.5" rx="0.75" fill="#F5F2D8" opacity="0.5" />
      <rect x="5" y="15.5" width="6" height="1.5" rx="0.75" fill="#F5F2D8" opacity="0.4" />
      <path d="M16 13 L17.5 15 L20 11" stroke="#141414" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GrammarIcon({ className, size = 24 }: IconProps) {
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
      <rect x="1" y="1" width="20" height="20" rx="6" fill="#F43F5E" stroke="#141414" strokeWidth="2.2" />
      <path d="M7 7 L10 7 L10 17 L7 17" stroke="#F5F2D8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      <path d="M13 7 L17 7" stroke="#F5F2D8" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M13 11 L16 11" stroke="#F5F2D8" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M13 15 L15 15" stroke="#F5F2D8" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M8.5 12 L10 12" stroke="#F5F2D8" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function MetricIcon({ className, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <rect x="1" y="9" width="3" height="5" rx="0.5" fill="currentColor" opacity="0.6" />
      <rect x="5.5" y="6" width="3" height="8" rx="0.5" fill="currentColor" opacity="0.8" />
      <rect x="10" y="2" width="3" height="12" rx="0.5" fill="currentColor" />
    </svg>
  );
}

export function TargetIcon({ className, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      <circle cx="8" cy="8" r="4" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function CheckShieldIcon({ className, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M8 1 L14 3.5 V8 C14 11.5 11 14 8 15 C5 14 2 11.5 2 8 V3.5 L8 1Z" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M5.5 8 L7 9.5 L10.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChatBubbleIcon({ className, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <rect x="1" y="2" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.6" />
      <circle cx="5" cy="6.5" r="0.8" fill="currentColor" opacity="0.5" />
      <circle cx="8" cy="6.5" r="0.8" fill="currentColor" opacity="0.5" />
      <circle cx="11" cy="6.5" r="0.8" fill="currentColor" opacity="0.5" />
      <path d="M4 11 L3 14 L6 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}

export function PenEditIcon({ className, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M10.5 1.5 L13.5 4.5 L5 13 L1.5 14 L2.5 10.5 L10.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
      <path d="M9 3 L12 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

