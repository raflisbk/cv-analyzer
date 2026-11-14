"use client";
import { useT } from "@/components/i18n/i18n-provider";
import { demoMatch } from "@/lib/landing-report";
import ScoreRing from "./score-ring";
import styles from "./demos.module.css";

export default function MatchDemo() {
  const { t } = useT();
  return (
    <div className={styles.match}>
      <ScoreRing score={demoMatch.score} label="Job match" />
      <div className={styles.requirements}>
        {demoMatch.requirements.map(({ key, evidence, met }) => (
          <div data-demo-requirement className={styles.requirement} key={key}>
            <span className={met ? styles.met : styles.missing}>
              {t(`landing.report.demo.${met ? "met" : "unmet"}`)}
            </span>
            <span>
              <strong>{t(`landing.report.demo.${key}`)}</strong>
              <small>{t(`landing.report.demo.${evidence}`)}</small>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
