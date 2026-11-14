"use client";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./main.module.css";
import CvExperience from "./cv-experience";

export default function CvMain() {
  const { t } = useT();
  return (
    <div className={styles.main}>
      <section data-sc-section="summary">
        <h6>{t("landing.sample.summary")}</h6>
        <p>
          {t("landing.sample.summaryStart")} <mark>checkout</mark>{" "}
          {t("landing.sample.and")} <mark>onboarding</mark>{" "}
          {t("landing.sample.summaryEnd")} <mark>fintech</mark>{" "}
          {t("landing.sample.summaryTail")}
        </p>
      </section>
      <CvExperience />
      <section data-sc-section="projects">
        <h6>{t("landing.sample.projects")}</h6>
        <ul>
          <li>{t("landing.sample.projectOne")}</li>
          <li>{t("landing.sample.projectTwo")}</li>
        </ul>
      </section>
      <section data-sc-section="education">
        <h6>{t("landing.sample.education")}</h6>
        <p>{t("landing.sample.degree")}</p>
      </section>
    </div>
  );
}
