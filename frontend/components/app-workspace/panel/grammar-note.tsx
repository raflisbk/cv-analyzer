import type { GrammarData } from "@/lib/app-api/grammar.types";
import styles from "../workspace-styles";

type Note = GrammarData["notes"][number];
export function GrammarNote({
  note,
  onResolve,
}: {
  note: Note;
  onResolve: (action: "accept" | "ignore") => void;
}) {
  return (
    <article className={styles.card}>
      <div className={styles.row}>
        <span className={styles.eyebrow}>{note.type}</span>
        <span>{note.location}</span>
      </div>
      <p>
        <s>{note.before}</s> → <strong>{note.after}</strong>
      </p>
      <div className={styles.row}>
        <button
          type="button"
          aria-label={`Accept ${note.type} change from ${note.before} to ${note.after}`}
          className={`${styles.pill} ${styles.punk}`}
          onClick={() => onResolve("accept")}
        >
          ✓ Accept
        </button>
        <button
          type="button"
          aria-label={`Ignore ${note.type} change from ${note.before}`}
          className={`${styles.pill} ${styles.snow}`}
          onClick={() => onResolve("ignore")}
        >
          × Ignore
        </button>
      </div>
    </article>
  );
}
