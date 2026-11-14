"use client";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./paper.module.css";

export default function CvSidebar() {
  const { t } = useT();
  return (
    <aside className={styles.sidebar}>
      <section data-sc-section="skills">
        <h6>{t("landing.sample.skills")}</h6>
        <div className={styles.chips}>
          <span>Figma</span>
          <span>{t("landing.sample.prototyping")}</span>
          <span>{t("landing.sample.research")}</span>
          <span>{t("landing.sample.systems")}</span>
          <span className={styles.missing}>SQL</span>
          <span className={styles.missing}>A/B testing</span>
        </div>
      </section>
      <section data-sc-section="certs">
        <h6>{t("landing.sample.certs")}</h6>
        <p>
          {t("landing.sample.uxCert")}
          <br />
          <em>2022</em>
        </p>
        <p>
          {t("landing.sample.accessCert")}
          <br />
          <em>2023</em>
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
