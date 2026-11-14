"use client";
import { useT } from "@/components/i18n/i18n-provider";
import { scoreBars } from "@/lib/landing-report";
import styles from "./feature-fragment.module.css";

export default function FeatureFragment({
  kind,
}: {
  kind: "scoring" | "editor";
}) {
  const { t } = useT();
  if (kind === "editor") {
    return (
      <div
        className={styles.rewrite}
        aria-label={t("landing.features.editorTitle")}
      >
        <del>{t("landing.report.before")}</del>
        <strong>{t("landing.report.after")}</strong>
      </div>
    );
  }
  return (
    <div className={styles.bars} aria-label={t("landing.report.dimensions")}>
      {scoreBars.slice(0, 3).map(({ key, value }) => (
        <div className={styles.bar} key={key}>
          <span>{t(`landing.report.bars.${key}`)}</span>
          <span
            className={styles.track}
            role="meter"
            aria-label={t(`landing.report.bars.${key}`)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
          >
            <span style={{ width: `${value}%` }} />
          </span>
          <b>{value}</b>
        </div>
      ))}
    </div>
  );
}
