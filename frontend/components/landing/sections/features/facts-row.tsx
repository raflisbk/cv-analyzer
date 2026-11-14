import { formatLandingCount, landingFacts } from "@/lib/landing-facts";
import styles from "./facts-row.module.css";

const facts = [
  { value: landingFacts.scoreDimensions, label: "scored dimensions" },
  { value: landingFacts.atsCheckCount, label: "ATS checks" },
  { value: landingFacts.exportTemplateCount, label: "export templates" },
];

export default function FactsRow() {
  return (
    <div className={styles.row} aria-label="CV Analyzer at a glance">
      {facts.map(({ value, label }) => (
        <div className={styles.fact} key={label}>
          <b data-value={value}>{formatLandingCount(value)}</b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
