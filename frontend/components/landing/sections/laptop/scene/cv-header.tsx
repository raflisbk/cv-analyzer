"use client";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./paper.module.css";

export default function CvHeader() {
  const { t } = useT();
  return (
    <header className={styles.header} data-sc-section="contact">
      <i className={styles.avatar}>SS</i>
      <div className={styles.name}>
        <b>Samuel Samdono</b>
        <span>{t("landing.sample.role")}</span>
        <div className={styles.tags}>
          <span>✓ {t("landing.sample.readable")}</span>
          <span>✓ {t("landing.sample.contactFound")}</span>
          <span>✓ {t("landing.sample.headings")}</span>
        </div>
      </div>
      <small>
        samuel@email.com · +62 812 5550 142
        <br />
        linkedin.com/in/samuelsamdono
        <br />
        {t("landing.sample.jakarta")}
      </small>
    </header>
  );
}
