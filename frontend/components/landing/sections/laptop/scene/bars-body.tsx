"use client";
import { useT } from "@/components/i18n/i18n-provider";
import type { Insight } from "@/lib/landing-laptop-insights";
import styles from "./body.module.css";

type Body = Extract<Insight["body"], { kind: "bars" }>;

export default function BarsBody({ body }: { body: Body }) {
  const { t } = useT();
  return (
    <div className={styles.bars}>
      {body.rows.map((row) => (
        <div key={t(row.label)}>
          <b>{t(row.label)}</b>
          <small>{t(row.value)}</small>
          <u>
            <s style={{ width: `${row.width}%` }} />
          </u>
        </div>
      ))}
    </div>
  );
}
