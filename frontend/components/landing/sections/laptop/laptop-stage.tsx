"use client";
import { useT } from "@/components/i18n/i18n-provider";
import LaptopScene from "./scene/laptop-scene";
import LaptopBase from "./laptop-base";
import LaptopLid from "./laptop-lid";
import styles from "./laptop.module.css";
import { laptopBody, screenSize } from "@/lib/landing-laptop-screen";

export default function LaptopStage() {
  const { t } = useT();
  return (
    <div
      className={styles.anchor}
      data-laptop-anchor
      style={{ aspectRatio: `${laptopBody.width + 140} / 760` }}
    >
      <div
        className={styles.stage}
        data-laptop-stage
        role="img"
        aria-label={t("landing.inside.opening")}
      >
        <LaptopBase />
        <LaptopLid>
          <div
            data-laptop-screen
            className={styles.screen}
            style={{ width: screenSize.width, height: screenSize.height }}
          >
            <LaptopScene />
            <i className={styles.sweep} data-laptop-sweep aria-hidden="true" />
          </div>
        </LaptopLid>
      </div>
    </div>
  );
}
