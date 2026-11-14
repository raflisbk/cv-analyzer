"use client";
import { useT } from "@/components/i18n/i18n-provider";
import { laptopInsights } from "@/lib/landing-laptop-insights";
import InsightBody from "./insight-body";
import styles from "./panel.module.css";

export default function InsightPanel() {
  const { t } = useT();
  return (
    <aside className={styles.panel} aria-label={t("landing.inside.panel")}>
      <div
        className={styles.announcement}
        aria-live="polite"
        data-sc-announcement
      />
      {laptopInsights.map((insight, index) => (
        <div
          key={insight.key}
          className={styles.state}
          data-sc-state={index}
          aria-hidden={index !== 0}
        >
          <span>{t(insight.eyebrow)}</span>
          <h3>{t(insight.title)}</h3>
          <InsightBody body={insight.body} />
          {insight.chip && <b className={styles.chip}>{t(insight.chip)}</b>}
        </div>
      ))}
      <div className={styles.dots} aria-hidden="true" data-sc-dots>
        {laptopInsights.slice(1).map((insight) => (
          <i key={insight.key} />
        ))}
      </div>
    </aside>
  );
}
