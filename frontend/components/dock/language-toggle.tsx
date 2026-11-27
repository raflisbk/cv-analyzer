"use client";

import { LOCALES } from "@/lib/i18n/locales";
import { useT } from "@/components/i18n/i18n-provider";
import { useLanguageSwitch } from "./use-language-switch";
import styles from "./language-toggle.module.css";

export default function LanguageToggle() {
  const { t } = useT();
  const { locale, choose } = useLanguageSwitch();
  return (
    <div
      role="group"
      aria-label={t("dock.language")}
      className={styles.pill}
      data-locale={locale}
    >
      <span className={styles.thumb} aria-hidden="true" />
      {LOCALES.map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={locale === item}
          onClick={() => choose(item)}
          className={styles.option}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
