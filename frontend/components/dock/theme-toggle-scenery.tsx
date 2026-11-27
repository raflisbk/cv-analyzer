import styles from "./theme-toggle.module.css";

const STARS = [
  [10, 9, 1.4],
  [18, 22, 1],
  [26, 12, 1.2],
  [34, 24, 0.9],
  [40, 8, 1.1],
  [14, 17, 0.8],
  [30, 18, 1],
];

export default function ThemeToggleScenery() {
  return (
    <>
      <span
        className={`${styles.layer} ${styles.skyLight}`}
        aria-hidden="true"
      />
      <span
        className={`${styles.layer} ${styles.skyDark}`}
        aria-hidden="true"
      />
      <svg
        className={`${styles.layer} ${styles.stars}`}
        viewBox="0 0 72 32"
        aria-hidden="true"
      >
        {STARS.map(([x, y, r], index) => (
          <circle
            key={index}
            cx={x}
            cy={y}
            r={r}
            fill="#fdfdff"
            style={{ animationDelay: `${index * 0.35}s` }}
          />
        ))}
      </svg>
      <svg
        className={`${styles.layer} ${styles.clouds}`}
        viewBox="0 0 72 32"
        aria-hidden="true"
      >
        <g className={styles.cloudDrift} fill="#ffffff">
          <ellipse cx="46" cy="28" rx="13" ry="6" />
          <ellipse cx="57" cy="26" rx="10" ry="7" />
          <ellipse cx="38" cy="29" rx="8" ry="5" />
          <ellipse cx="66" cy="29" rx="9" ry="5" />
        </g>
      </svg>
      <svg
        className={`${styles.layer} ${styles.darkCloud}`}
        viewBox="0 0 72 32"
        aria-hidden="true"
      >
        <g fill="#5b6480" opacity="0.55">
          <ellipse cx="18" cy="30" rx="10" ry="4" />
          <ellipse cx="27" cy="31" rx="8" ry="4" />
        </g>
      </svg>
    </>
  );
}
