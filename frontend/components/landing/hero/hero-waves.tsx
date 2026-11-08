import styles from "./hero.module.css";

export default function HeroWaves() {
  return (
    <svg
      className={styles.waves}
      viewBox="0 0 1200 760"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 520 C220 380 380 640 620 500 S980 300 1200 430 V760 H0Z"
        fill="var(--brand-red-deep)"
        opacity=".55"
      />
      <path
        d="M0 610 C260 480 440 720 700 600 S1040 450 1200 550 V760 H0Z"
        fill="var(--brand-blush)"
        opacity=".2"
      />
      <path
        d="M640 0 C720 130 880 150 990 90 S1160 30 1200 120 V0Z"
        fill="var(--brand-red-deep)"
        opacity=".5"
      />
    </svg>
  );
}
