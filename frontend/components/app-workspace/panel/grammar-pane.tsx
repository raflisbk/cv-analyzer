import type { GrammarData } from "@/lib/app-api/grammar.types";
import { GrammarSummary } from "./grammar-summary";
import { GrammarNotes } from "./grammar-notes";
import styles from "../workspace-styles";

export function GrammarPane({
  data,
  error,
  resolved,
  onResolve,
}: {
  data?: GrammarData;
  error?: Error | null;
  resolved: Set<string>;
  onResolve: (id: string, action: "accept" | "ignore") => Promise<void>;
}) {
  if (error) {
    return (
      <div role="alert">Grammar notes could not load. Try again later.</div>
    );
  }
  if (!data) {
    return <div role="status">Loading grammar notes…</div>;
  }
  const remaining = data.notes.filter((note) => !resolved.has(note.id));
  return (
    <div className={styles.pane}>
      <GrammarSummary count={remaining.length} stats={data.stats} />
      <GrammarNotes notes={remaining} onResolve={onResolve} />
    </div>
  );
}
