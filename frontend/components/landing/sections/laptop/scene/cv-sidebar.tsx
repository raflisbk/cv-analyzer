"use client";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./paper.module.css";

export default function CvSidebar() {
  const { t } = useT();
  return (
    <aside className={styles.sidebar}>
      <section data-sc-section="education">
        <h6>{t("landing.sample.education")}</h6>
        <p>
          <b>{t("landing.sample.degreeName")}</b>
          <br />
          {t("landing.sample.school")}
          <br />
          <em>2013 – 2017</em>
        </p>
      </section>
      <section data-sc-section="skills">
        <h6>{t("landing.sample.skills")}</h6>
        <p>
          Figma, {t("landing.sample.prototyping")},{" "}
          {t("landing.sample.research")}, {t("landing.sample.systems")}
        </p>
        <p className={styles.missing}>
          <span>SQL</span>
          <span>A/B testing</span>
        </p>
      </section>
      <section data-sc-section="certs">
        <h6>{t("landing.sample.certs")}</h6>
        <p>
          {t("landing.sample.uxCert")} <em>2022</em>
        </p>
        <p>
          {t("landing.sample.accessCert")} <em>2023</em>
        </p>
      </section>
      <section data-sc-section="lang">
        <h6>{t("landing.sample.languages")}</h6>
        <p>
          {t("landing.sample.indonesian")} <em>{t("landing.sample.native")}</em>
        </p>
        <p>
          {t("landing.sample.english")} <em>{t("landing.sample.fluent")}</em>
        </p>
      </section>
    </aside>
  );
}
