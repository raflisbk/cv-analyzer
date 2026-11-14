"use client";
import { useT } from "@/components/i18n/i18n-provider";
import Link from "next/link";
import PlaneIcon from "../plane-icon";
import PenUnderline from "../../pen/pen-underline";
import pen from "../../pen/pen.module.css";
import base from "../section.module.css";
import styles from "./cta.module.css";

export default function CtaCopy() {
  const { t } = useT();
  return (
    <div className={styles.copy}>
      <span data-cta-tag className={styles.tag}>
        {t("landing.cta.tag")}
      </span>
      <h2>
        <span className={pen.target}>
          {t("landing.cta.heading")}
          <PenUnderline variant={1} />
        </span>
      </h2>
      <p>{t("landing.cta.body")}</p>
      <div className={styles.actions}>
        <Link href="/app" className={`${base.button} ${styles.primary}`}>
          {t("landing.cta.button")} <PlaneIcon size={52} />
        </Link>
        <a href="#report" className={styles.sample}>
          {t("landing.cta.sample")}
        </a>
      </div>
    </div>
  );
}
