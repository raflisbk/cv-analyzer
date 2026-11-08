import type { Insight } from "@/lib/landing-laptop-insights";
import styles from "./body.module.css";

type Body = Extract<Insight["body"], { kind: "edit" }>;

export default function EditBody({ body }: { body: Body }) {
  return (
    <>
      <div className={styles.diff}>
        <s>{body.before}</s>
        <strong>{body.after}</strong>
      </div>
      <div className={styles.actions}>
        {body.actions.map((action, index) => (
          <i className={index ? styles.outline : ""} key={action}>
            {action}
          </i>
        ))}
      </div>
    </>
  );
}
