"use client";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./document-demos.module.css";

export default function BuilderDemo() {
  const { t } = useT();
  return (
    <div
      className={styles.builder}
      role="img"
      aria-label={t("landing.products.builderAlt")}
    >
      <span>
        {t("landing.products.builderName")}
        <span className={styles.caret} />
      </span>
      {["profile", "experience", "skills"].map((section) => (
        <div className={styles.skeleton} key={section}>
          <strong>{t(`landing.products.builderSections.${section}`)}</strong>
          <i />
          <i />
        </div>
      ))}
    </div>
  );
}
