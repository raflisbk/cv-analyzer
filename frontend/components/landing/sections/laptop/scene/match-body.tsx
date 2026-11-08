import type { Insight } from "@/lib/landing-laptop-insights";
import styles from "./body.module.css";
import MatchRing from "./match-ring";

type Body = Extract<Insight["body"], { kind: "match" }>;

export default function MatchBody({ body }: { body: Body }) {
  return (
    <>
      <div className={styles.match}>
        <MatchRing />
        <strong>{body.percent}%</strong>
        <p>{body.text}</p>
      </div>
      <div className={styles.keywords}>
        {body.keywords.map((word) => (
          <i key={word}>{word}</i>
        ))}
        {body.missing.map((word) => (
          <i className={styles.missing} key={word}>
            {word}
          </i>
        ))}
      </div>
    </>
  );
}
