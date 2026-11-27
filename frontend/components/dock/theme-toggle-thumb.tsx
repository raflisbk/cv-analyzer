import styles from "./theme-toggle.module.css";

export default function ThemeToggleThumb() {
  return (
    <span className={styles.thumb} aria-hidden="true">
      <svg className={styles.sun} viewBox="0 0 28 28">
        <circle cx="14" cy="14" r="12" fill="#ffb867" />
        <circle cx="14" cy="14" r="12" fill="url(#sunGlow)" />
        <defs>
          <radialGradient id="sunGlow" cx="35%" cy="30%" r="80%">
            <stop offset="0" stopColor="#ffd9a0" />
            <stop offset="1" stopColor="#ff9f4a" />
          </radialGradient>
        </defs>
      </svg>
      <svg className={styles.moon} viewBox="0 0 28 28">
        <path
          d="M20 3.5A12 12 0 1 0 24.5 19 9.5 9.5 0 0 1 20 3.5Z"
          fill="#e9e6f5"
        />
        <circle cx="11" cy="17" r="1.6" fill="#cfcae6" />
        <circle cx="15" cy="9" r="1" fill="#cfcae6" />
      </svg>
    </span>
  );
}
