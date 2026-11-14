"use client";
import { useT } from "@/components/i18n/i18n-provider";
import ScoreRing from "@/components/landing/product-demos/score-ring";
import RewriteDemo from "@/components/landing/product-demos/rewrite-demo";
import styles from "./cta.module.css";

export default function CtaArt() {
  const { t } = useT();
  return (
    <div className={styles.art} aria-label={t("landing.cta.art")}>
      <div className={styles.sampleScore}>
        <ScoreRing />
        <span>
          Samuel Samdono
          <br />
          {t("landing.cta.designer")}
        </span>
      </div>
      <RewriteDemo />
    </div>
  );
}
