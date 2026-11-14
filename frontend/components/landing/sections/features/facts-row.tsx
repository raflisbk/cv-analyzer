"use client";
import { useT } from "@/components/i18n/i18n-provider";
import { formatLandingCount, landingFacts } from "@/lib/landing-facts";
import styles from "./facts-row.module.css";

const facts = [
  { value: landingFacts.scoreDimensions, key: "dimensions" },
  { value: landingFacts.atsCheckCount, key: "ats" },
  { value: landingFacts.exportTemplateCount, key: "templates" },
];

export default function FactsRow() {
  const { t } = useT();
  return (
    <div className={styles.row} aria-label={t("landing.features.factsLabel")}>
      {facts.map(({ value, key }) => (
        <div className={styles.fact} key={key}>
          <b data-value={value}>{formatLandingCount(value)}</b>
          <span>{t(`landing.features.${key}`)}</span>
        </div>
      ))}
    </div>
  );
}
