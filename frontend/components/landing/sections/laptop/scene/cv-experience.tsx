"use client";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./main.module.css";

export default function CvExperience() {
  const { t } = useT();
  return (
    <section>
      <h6>{t("landing.sample.experience")}</h6>
      <div className={styles.job} data-sc-section="payly">
        <div className={styles.role}>
          <b>{t("landing.sample.senior")}</b>
          <span>{t("landing.sample.present")}</span>
        </div>
        <ul>
          <li className={styles.editLine} data-sc-section="edit">
            <s>{t("landing.sample.oldBullet")}</s>
            <em>{t("landing.sample.newBullet")}</em>
            <u>{t("landing.sample.noNumber")}</u>
          </li>
          <li>{t("landing.sample.sourcedResult")}</li>
          <li>{t("landing.sample.mobile")}</li>
          <li>{t("landing.sample.critique")}</li>
        </ul>
      </div>
      <div className={styles.job} data-sc-section="brightly">
        <div className={styles.role}>
          <b>{t("landing.sample.designer")}</b>
          <span>{t("landing.sample.range")}</span>
        </div>
        <ul>
          <li>{t("landing.sample.merchant")}</li>
          <li>{t("landing.sample.system")}</li>
        </ul>
      </div>
    </section>
  );
}
