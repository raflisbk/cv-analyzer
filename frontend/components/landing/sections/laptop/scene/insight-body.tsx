"use client";
import { useT } from "@/components/i18n/i18n-provider";
import type { Insight } from "@/lib/landing-laptop-insights";
import MatchBody from "./match-body";
import BarsBody from "./bars-body";
import EditBody from "./edit-body";
import styles from "./body.module.css";

export default function InsightBody({ body }: { body: Insight["body"] }) {
  const { t } = useT();
  if (body.kind === "intro") {
    return (
      <>
        <p>{t(body.text)}</p>
        <div className={styles.legend}>
          {body.labels.map((label) => (
            <em key={t(label)}>{t(label)}</em>
          ))}
        </div>
      </>
    );
  }
  if (body.kind === "checks") {
    return (
      <ul className={styles.checks}>
        {body.items.map((item) => (
          <li key={t(item)}>{t(item)}</li>
        ))}
      </ul>
    );
  }
  if (body.kind === "match") {
    return <MatchBody body={body} />;
  }
  if (body.kind === "bars") {
    return <BarsBody body={body} />;
  }
  return <EditBody body={body} />;
}
