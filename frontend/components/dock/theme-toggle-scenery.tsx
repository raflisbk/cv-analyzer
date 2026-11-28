import styles from "./theme-toggle.module.css";

const STARS = [
  [7, 8, 1.3],
  [15, 5, 1],
  [29, 9, 1.2],
  [5, 19, 0.9],
  [31, 21, 1],
  [22, 6, 0.8],
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
        viewBox="0 0 36 36"
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
        viewBox="0 0 36 36"
        aria-hidden="true"
      >
        <g className={styles.cloudDrift} fill="#ffffff">
          <ellipse cx="24" cy="31" rx="9" ry="4.5" />
          <ellipse cx="30" cy="29" rx="6" ry="5" />
          <ellipse cx="17" cy="32" rx="6" ry="3.5" />
        </g>
      </svg>
      <svg
        className={`${styles.layer} ${styles.darkCloud}`}
        viewBox="0 0 36 36"
        aria-hidden="true"
      >
        <g fill="#5b6480" opacity="0.55">
          <ellipse cx="9" cy="32" rx="8" ry="3.5" />
          <ellipse cx="24" cy="33" rx="7" ry="3.5" />
        </g>
      </svg>
    </>
  );
}
