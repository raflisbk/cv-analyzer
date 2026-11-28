"use client";

import { useT } from "@/components/i18n/i18n-provider";
import { useTheme } from "@/hooks/use-theme";
import MoonFace from "./moon-face";
import SunFace from "./sun-face";
import styles from "./theme-button.module.css";

export default function ThemeButton() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useT();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      className={styles.button}
      data-dark={dark}
      aria-label={t("toggles.theme")}
      aria-pressed={dark}
      onClick={toggleTheme}
    >
      <span className={styles.face}>
        <span className={`${styles.layer} ${styles.light}`}>
          <SunFace />
        </span>
        <span className={`${styles.layer} ${styles.night}`}>
          <MoonFace />
        </span>
      </span>
    </button>
  );
}
