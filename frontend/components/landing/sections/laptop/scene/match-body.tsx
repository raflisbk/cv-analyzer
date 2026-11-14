"use client";
import { useT } from "@/components/i18n/i18n-provider";
import type { Insight } from "@/lib/landing-laptop-insights";
import styles from "./body.module.css";
import MatchRing from "./match-ring";

type Body = Extract<Insight["body"], { kind: "match" }>;

export default function MatchBody({ body }: { body: Body }) {
  const { t } = useT();
  return (
    <>
      <div className={styles.match}>
        <MatchRing />
        <strong>{body.percent}%</strong>
        <p>{t(body.text)}</p>
      </div>
      <div className={styles.keywords}>
        {body.keywords.map((word) => (
          <i key={t(word)}>{t(word)}</i>
        ))}
        {body.missing.map((word) => (
          <i className={styles.missing} key={t(word)}>
            {t(word)}
          </i>
        ))}
      </div>
    </>
  );
}
