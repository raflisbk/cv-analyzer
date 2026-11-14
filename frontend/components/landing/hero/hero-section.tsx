"use client";
import { useT } from "@/components/i18n/i18n-provider";

import { useHeroChrome } from "./use-hero-chrome";
import HeroObjects from "./hero-objects";
import HeroCopy from "./hero-copy";
import HeroWaves from "./hero-waves";
import Navbar from "@/components/landing/navbar";
import styles from "./hero.module.css";
import announcementStyles from "./hero-announcement.module.css";

export default function HeroSection() {
  const { t } = useT();
  const { announcementRef, heroRef } = useHeroChrome();

  return (
    <>
      <div ref={announcementRef} className={announcementStyles.announcement}>
        <span>
          {t("landing.announcement.text")}
          <span className={announcementStyles.announcementMore}></span>
        </span>
        <a href="#products">{t("landing.announcement.link")}</a>
      </div>
      <Navbar />
      <section
        id="hero"
        ref={heroRef}
        className={styles.hero}
        data-landing-hero
      >
        <HeroWaves />
        <div className={styles.body}>
          <HeroCopy />
          <HeroObjects />
        </div>
      </section>
    </>
  );
}
