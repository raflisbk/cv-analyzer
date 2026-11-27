"use client";
import { useT } from "@/components/i18n/i18n-provider";
import CvSkills from "./cv-skills";
import styles from "./paper.module.css";

const CERTS = [
  { name: "uxCert", issuer: "uxIssuer", year: "2022" },
  { name: "accessCert", issuer: "accessIssuer", year: "2023" },
  { name: "sprintCert", issuer: "sprintIssuer", year: "2024" },
];

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
          <em>{t("landing.sample.years")}</em>
        </p>
        <p>{t("landing.sample.gpa")}</p>
        <p>{t("landing.sample.thesis")}</p>
      </section>
      <CvSkills />
      <section data-sc-section="certs">
        <h6>{t("landing.sample.certs")}</h6>
        {CERTS.map((cert) => (
          <p key={cert.name}>
            {t(`landing.sample.${cert.name}`)}
            <br />
            <em>
              {t(`landing.sample.${cert.issuer}`)} · {cert.year}
            </em>
          </p>
        ))}
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
