"use client";

import Image from "next/image";
import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./nav-actions.module.css";

export default function NavCta() {
  const { t } = useT();
  return (
    <Link
      href="/app"
      className={styles.cta}
      aria-label={t("landing.hero.button")}
      data-nav-cta
    >
      <span className={styles.ctaFull} aria-hidden="true">
        {t("landing.hero.button")}
      </span>
      <span className={styles.ctaShort} aria-hidden="true">
        {t("nav.ctaShort")}
      </span>
      <Image
        src="/landing/3d/paper-plane.webp"
        alt=""
        width={40}
        height={40}
        className={styles.plane}
        aria-hidden="true"
      />
    </Link>
  );
}
