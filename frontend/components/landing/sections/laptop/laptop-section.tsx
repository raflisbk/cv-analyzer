"use client";
import { useT } from "@/components/i18n/i18n-provider";

import { useRef } from "react";
import { useLandingLaptop } from "@/hooks/use-landing-laptop";
import LaptopStage from "./laptop-stage";
import base from "../section.module.css";
import styles from "./laptop.module.css";

export default function LaptopSection() {
  const { t } = useT();
  const ref = useRef<HTMLElement>(null);
  useLandingLaptop(ref);
  return (
    <section
      id="features"
      ref={ref}
      className={`${base.panel} ${base.blush} ${styles.section}`}
    >
      <div className={styles.text} data-laptop-text>
        <h2>{t("landing.inside.heading")}</h2>
        <span className={base.hand}>{t("landing.inside.hint")}</span>
        <p>{t("landing.inside.body")}</p>
        <ul className={styles.chips}>
          {["contact", "experience", "skills", "edit"].map((chip) => (
            <li key={chip}>{t(`landing.inside.chips.${chip}`)}</li>
          ))}
        </ul>
      </div>
      <div className={styles.visual}>
        <LaptopStage />
      </div>
    </section>
  );
}
