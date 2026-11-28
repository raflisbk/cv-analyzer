"use client";

import { LOCALES } from "@/lib/i18n/locales";
import { useT } from "@/components/i18n/i18n-provider";
import { useLanguageSwitch } from "@/hooks/use-language-switch";
import styles from "./language-button.module.css";

export default function LanguageButton() {
  const { t } = useT();
  const { locale, choose } = useLanguageSwitch();
  const other = LOCALES.find((item) => item !== locale) ?? locale;
  const label = t("toggles.language");
  return (
    <button
      type="button"
      className={styles.button}
      aria-label={label}
      title={label}
      onClick={() => choose(other)}
    >
      <span key={locale} className={styles.code} lang={locale}>
        {locale.toUpperCase()}
      </span>
    </button>
  );
}
