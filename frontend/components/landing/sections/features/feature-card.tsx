"use client";
import { useT } from "@/components/i18n/i18n-provider";
import { features } from "@/lib/landing-features";
import { formatLandingCount, landingFacts } from "@/lib/landing-facts";
import styles from "./features.module.css";
import FeatureFragment from "./feature-fragment";

export default function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[number];
  index: number;
}) {
  const { t } = useT();
  const description =
    feature.key === "scoring"
      ? t("landing.features.scoringBody", {
          count: formatLandingCount(landingFacts.scoreDimensions),
        })
      : t("landing.features.editorBody");
  return (
    <article className={`${styles.card} ${styles[`card${index}`]}`}>
      <h3>{t(`landing.features.${feature.key}Title`)}</h3>
      <p>{description}</p>
      <FeatureFragment kind={feature.key} />
    </article>
  );
}
