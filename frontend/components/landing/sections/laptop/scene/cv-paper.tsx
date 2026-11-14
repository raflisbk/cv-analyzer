"use client";
import { useT } from "@/components/i18n/i18n-provider";
import CvHeader from "./cv-header";
import CvSidebar from "./cv-sidebar";
import CvMain from "./cv-main";
import styles from "./paper.module.css";

export default function CvPaper() {
  const { t } = useT();
  return (
    <article
      className={styles.paper}
      data-sc-paper
      aria-label={t("landing.inside.paper")}
    >
      <CvHeader />
      <CvSidebar />
      <CvMain />
      <i className={styles.highlight} data-sc-highlight aria-hidden="true" />
    </article>
  );
}
