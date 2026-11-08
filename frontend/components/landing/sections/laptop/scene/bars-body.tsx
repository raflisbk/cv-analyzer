import type { Insight } from "@/lib/landing-laptop-insights";
import styles from "./body.module.css";

type Body = Extract<Insight["body"], { kind: "bars" }>;

export default function BarsBody({ body }: { body: Body }) {
  return (
    <div className={styles.bars}>
      {body.rows.map((row) => (
        <div key={row.label}>
          <b>{row.label}</b>
          <small>{row.value}</small>
          <u>
            <s style={{ width: `${row.width}%` }} />
          </u>
        </div>
      ))}
    </div>
  );
}
