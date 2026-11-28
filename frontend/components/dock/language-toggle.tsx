"use client";

import { LOCALES } from "@/lib/i18n/locales";
import { useT } from "@/components/i18n/i18n-provider";
import { useLanguageSwitch } from "./use-language-switch";
import styles from "./language-toggle.module.css";

export default function LanguageToggle() {
  const { t } = useT();
  const { locale, choose } = useLanguageSwitch();
  const other = LOCALES.find((item) => item !== locale) ?? locale;
  const label = t("dock.switchLanguage");
  return (
    <button
      type="button"
      className={styles.button}
      aria-label={label}
      title={label}
      lang={locale}
      onClick={() => choose(other)}
    >
      {locale.toUpperCase()}
    </button>
  );
}
