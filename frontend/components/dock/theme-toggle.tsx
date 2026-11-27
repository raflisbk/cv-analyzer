"use client";

import { useT } from "@/components/i18n/i18n-provider";
import { useTheme } from "@/hooks/use-theme";
import ThemeToggleScenery from "./theme-toggle-scenery";
import ThemeToggleThumb from "./theme-toggle-thumb";
import styles from "./theme-toggle.module.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useT();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={t("dock.theme")}
      title={t(dark ? "dock.themeDark" : "dock.themeLight")}
      className={styles.toggle}
      data-dark={dark}
      onClick={toggleTheme}
    >
      <ThemeToggleScenery />
      <ThemeToggleThumb />
    </button>
  );
}
