"use client";
import { useT } from "@/components/i18n/i18n-provider";
import Link from "next/link";
import Image from "next/image";
import styles from "./hero.module.css";
import buttonStyles from "./hero-button.module.css";
import PenUnderline from "../pen/pen-underline";
import pen from "../pen/pen.module.css";

export default function HeroCopy() {
  const { t } = useT();
  return (
    <div className={styles.copy}>
      <span className={styles.live} data-hero-live>
        <span aria-hidden="true" />
        {t("landing.hero.live")}
      </span>
      <h1>
        <span data-hero-word>{t("landing.hero.line1")}</span>{" "}
        <span data-hero-word>{t("landing.hero.line2")}</span>{" "}
        <span data-hero-word>
          <span className={pen.target}>
            {t("landing.hero.line3")}
            <PenUnderline variant={1} delay={0.4} onDark />
          </span>
        </span>
      </h1>
      <p data-hero-copy>{t("landing.hero.body")}</p>
      <Link className={buttonStyles.button} href="/app" data-hero-cta>
        <span>{t("landing.hero.button")}</span>
        <Image
          className={buttonStyles.plane}
          src="/landing/3d/paper-plane.webp"
          width={56}
          height={56}
          alt=""
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}
