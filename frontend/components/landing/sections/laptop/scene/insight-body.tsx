import type { Insight } from "@/lib/landing-laptop-insights";
import MatchBody from "./match-body";
import BarsBody from "./bars-body";
import EditBody from "./edit-body";
import styles from "./body.module.css";

export default function InsightBody({ body }: { body: Insight["body"] }) {
  if (body.kind === "intro") {
    return (
      <>
        <p>{body.text}</p>
        <div className={styles.legend}>
          {body.labels.map((label) => (
            <em key={label}>{label}</em>
          ))}
        </div>
      </>
    );
  }
  if (body.kind === "checks") {
    return (
      <ul className={styles.checks}>
        {body.items.map((item) => (
          <li key={item}>{item}</li>
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
