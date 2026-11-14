"use client";
import { useT } from "@/components/i18n/i18n-provider";
import { useRef } from "react";
import { useHeroLines } from "../motion/hero-lines";
import Image from "next/image";
import { HERO_OBJECTS, HERO_STICKERS } from "@/lib/landing-hero-layout";
import styles from "./hero-objects.module.css";
import MarginNote from "../pen/margin-note";

export default function HeroObjects() {
  const { t } = useT();
  const ref = useRef<HTMLDivElement>(null);
  useHeroLines(ref);
  return (
    <div ref={ref} className={styles.stage}>
      <div
        className={styles.sheet}
        data-hero-object
        id="hero-cv-sheet"
        aria-describedby="hero-cv-sheet-note"
        role="img"
        aria-label={t("landing.hero.sheet")}
      >
        <Image
          src={`/landing/3d/${HERO_OBJECTS[0].asset}.webp`}
          alt=""
          fill
          sizes="(max-width: 768px) 220px, 400px"
        />
      </div>
      <div className={styles.note}>
        <MarginNote targetId="hero-cv-sheet" variant={2} delay={0.7}>
          {t("landing.hero.note")}
        </MarginNote>
      </div>
      {HERO_STICKERS.map((item) => (
        <span
          key={item.name}
          className={`${styles.callout} ${styles[item.name]}`}
          data-hero-sticker
        >
          {t(`landing.hero.${item.name}`)}
          <i data-leader-line aria-hidden="true" />
        </span>
      ))}
    </div>
  );
}
