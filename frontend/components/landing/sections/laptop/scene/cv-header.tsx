"use client";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./paper.module.css";

export default function CvHeader() {
  const { t } = useT();
  return (
    <header className={styles.header} data-sc-section="contact">
      <b>Samuel Samdono</b>
      <span>{t("landing.sample.role")}</span>
      <small>
        <i>samuel@email.com</i>
        <i>+62 812 5550 142</i>
        <i>linkedin.com/in/samuelsamdono</i>
        <i>{t("landing.sample.site")}</i>
        <i>{t("landing.sample.jakarta")}</i>
      </small>
    </header>
  );
}
