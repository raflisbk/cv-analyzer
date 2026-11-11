import type { GrammarData } from "@/lib/app-api/grammar.types";
import styles from "../workspace-styles";

export function GrammarAcceptAll({
  notes,
  accept,
}: {
  notes: GrammarData["notes"];
  accept: (id: string) => Promise<void>;
}) {
  if (!notes.length) {
    return null;
  }
  return (
    <button
      type="button"
      className={`${styles.pill} ${styles.punk}`}
      onClick={() =>
        void Promise.all(
          notes
            .filter((note) => note.type !== "style")
            .map((note) => accept(note.id)),
        )
      }
    >
      Accept all spelling and grammar
    </button>
  );
}
