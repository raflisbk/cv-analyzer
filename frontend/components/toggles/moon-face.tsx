import styles from "./theme-button.module.css";

const SPARKLES = [
  { x: 7, y: 8, r: 2.2, delay: "0s" },
  { x: 29, y: 9, r: 1.8, delay: "0.8s" },
  { x: 28, y: 28, r: 1.5, delay: "1.5s" },
];

function sparklePath({ x, y, r }: { x: number; y: number; r: number }) {
  return `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;
}

export default function MoonFace() {
  return (
    <svg viewBox="0 0 36 36" aria-hidden="true" focusable="false">
      {SPARKLES.map((sparkle) => (
        <path
          key={sparkle.x}
          className={styles.sparkle}
          d={sparklePath(sparkle)}
          fill="#f2ff00"
          style={{
            animationDelay: sparkle.delay,
            transformOrigin: `${sparkle.x}px ${sparkle.y}px`,
          }}
        />
      ))}
      <circle cx="18" cy="18" r="8.4" fill="#fdfdff" />
      <path
        d="M13.6 17.2Q15 18.6 16.4 17.2M19.6 17.2Q21 18.6 22.4 17.2"
        fill="none"
        stroke="#1a0b07"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16.2 21Q18 22.4 19.8 21"
        fill="none"
        stroke="#1a0b07"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="12.6" cy="20.4" r="1.3" fill="#ffb3a1" opacity=".8" />
      <circle cx="23.4" cy="20.4" r="1.3" fill="#ffb3a1" opacity=".8" />
    </svg>
  );
}
