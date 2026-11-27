"use client";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./main.module.css";
import CvJob from "./cv-job";

const bullets = (keys: string[], t: (key: string) => string) =>
  keys.map((key) => <li key={key}>{t(`landing.sample.${key}`)}</li>);

export default function CvExperience() {
  const { t } = useT();
  return (
    <section>
      <h6>{t("landing.sample.experience")}</h6>
      <CvJob
        section="payly"
        title={t("landing.sample.senior")}
        range={t("landing.sample.present")}
      >
        <li className={styles.editLine} data-sc-section="edit">
          <s>{t("landing.sample.oldBullet")}</s>
          <em>{t("landing.sample.newBullet")}</em>
          <u>{t("landing.sample.noNumber")}</u>
        </li>
        {bullets(["sourcedResult", "mobile", "usability"], t)}
      </CvJob>
      <CvJob
        section="brightly"
        title={t("landing.sample.designer")}
        range={t("landing.sample.range")}
      >
        {bullets(["merchant", "system", "discovery"], t)}
      </CvJob>
      <CvJob
        title={t("landing.sample.junior")}
        range={t("landing.sample.juniorRange")}
      >
        {bullets(["juniorOne", "juniorTwo", "juniorThree"], t)}
      </CvJob>
    </section>
  );
}
