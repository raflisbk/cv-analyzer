import type { ReportDetail } from "@/lib/app-api/report-detail.types";
import { ReportHeading } from "./report-heading";
import styles from "./report.module.css";

export function ReportGrammar({
  grammar,
}: {
  grammar: ReportDetail["grammar"];
}) {
  return (
    <section
      className={`${styles.card} ${styles.span3}`}
      id="report-language"
      aria-label="Grammar and style"
    >
      <ReportHeading title="Grammar and style" helpKey="grammar" />
      <div className={styles.grammarBars}>
        {(["spelling", "grammar", "style"] as const).map((key) => (
          <div key={key}>
            <strong>{grammar[key]}</strong>
            <i style={{ height: `${Math.max(12, grammar[key] * 16)}px` }} />
            <span>{key[0].toUpperCase() + key.slice(1)}</span>
          </div>
        ))}
      </div>
      <p className={styles.caption}>
        {grammar.spelling + grammar.grammar + grammar.style} notes. Style ones
        are optional.
      </p>
      <div className={styles.scrollArea}>
        {grammar.notes.map((note) => (
          <div className={styles.note} key={note.before}>
            <s>{note.before}</s> → <b>{note.after}</b>
            <small>{note.location}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
