"use client";
import { useT } from "@/components/i18n/i18n-provider";
import Image from "next/image";
import PenUnderline from "../../pen/pen-underline";
import pen from "../../pen/pen.module.css";
import base from "../section.module.css";
import styles from "./faq.module.css";

export default function FaqHeader() {
  const { t } = useT();
  return (
    <div>
      <h2>
        <span className={pen.target}>
          {t("landing.faq.heading")}
          <PenUnderline variant={2} />
        </span>
      </h2>
      <div className={styles.objects} aria-hidden="true">
        <Image
          width={360}
          height={360}
          data-faq-object
          className={base.object}
          src="/landing/3d/question-mark.webp"
          alt=""
        />
        <Image
          width={360}
          height={360}
          data-faq-object
          className={base.object}
          src="/landing/3d/speech-bubbles.webp"
          alt=""
        />
      </div>
    </div>
  );
}
