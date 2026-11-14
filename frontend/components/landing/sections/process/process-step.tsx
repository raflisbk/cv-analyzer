"use client";
import { useT } from "@/components/i18n/i18n-provider";
import Image from "next/image";
import { processSteps } from "@/lib/landing-process";
import base from "../section.module.css";
import styles from "./process.module.css";

export default function ProcessStep({
  step,
  index,
}: {
  step: (typeof processSteps)[number];
  index: number;
}) {
  const { t } = useT();
  return (
    <article className={styles.item}>
      <div className={styles.text}>
        <span className={styles.number}>{index + 1}</span>
        <h3>{t(`landing.process.steps.${step.key}.title`)}</h3>
        <p>{t(`landing.process.steps.${step.key}.body`)}</p>
      </div>
      <div className={styles.visual}>
        <Image
          width={360}
          height={360}
          className={base.object}
          src={`/landing/3d/${step.image}.webp`}
          alt=""
          aria-hidden="true"
        />
        <span className={styles.sticker}>
          {t(`landing.process.steps.${step.key}.sticker`)}
        </span>
      </div>
    </article>
  );
}
