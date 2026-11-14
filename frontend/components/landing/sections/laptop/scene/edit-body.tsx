"use client";
import { useT } from "@/components/i18n/i18n-provider";
import type { Insight } from "@/lib/landing-laptop-insights";
import styles from "./body.module.css";

type Body = Extract<Insight["body"], { kind: "edit" }>;

export default function EditBody({ body }: { body: Body }) {
  const { t } = useT();
  return (
    <>
      <div className={styles.diff}>
        <s>{t(body.before)}</s>
        <strong>{t(body.after)}</strong>
      </div>
      <div className={styles.actions}>
        {body.actions.map((action, index) => (
          <i className={index ? styles.outline : ""} key={t(action)}>
            {t(action)}
          </i>
        ))}
      </div>
    </>
  );
}
