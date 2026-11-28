const RAYS = Array.from({ length: 8 }, (_, index) => index * 45);

export default function SunFace() {
  return (
    <svg viewBox="0 0 36 36" aria-hidden="true" focusable="false">
      {RAYS.map((angle) => (
        <line
          key={angle}
          x1="18"
          y1="7"
          x2="18"
          y2="4"
          stroke="#f42902"
          strokeWidth="2.6"
          strokeLinecap="round"
          transform={`rotate(${angle} 18 18)`}
        />
      ))}
      <circle cx="18" cy="18" r="8" fill="#f2ff00" />
      <circle cx="15" cy="17" r="1.3" fill="#1a0b07" />
      <circle cx="21" cy="17" r="1.3" fill="#1a0b07" />
      <path
        d="M15.2 20.3Q18 23 20.8 20.3"
        fill="none"
        stroke="#1a0b07"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12.8" cy="20" r="1.3" fill="#ff8f73" opacity=".75" />
      <circle cx="23.2" cy="20" r="1.3" fill="#ff8f73" opacity=".75" />
    </svg>
  );
}
