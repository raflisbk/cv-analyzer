import type { GrammarData } from "@/lib/app-api/grammar.types";
import LoadingSkeleton from "@/components/app-shell/loading-skeleton";
import { GrammarSummary } from "./grammar-summary";
import { GrammarNotes } from "./grammar-notes";
import styles from "../workspace-styles";

export function GrammarPane({
  data,
  error,
  retry,
  resolved,
  onResolve,
}: {
  data?: GrammarData;
  error?: Error | null;
  retry?: () => void;
  resolved: Set<string>;
  onResolve: (id: string, action: "accept" | "ignore") => Promise<void>;
}) {
  if (error) {
    return (
      <div role="alert">
        Grammar notes could not load.{" "}
        <button type="button" onClick={retry}>
          Try again
        </button>
      </div>
    );
  }
  if (!data) {
    return <LoadingSkeleton label="Loading grammar notes" />;
  }
  const remaining = data.notes.filter((note) => !resolved.has(note.id));
  return (
    <div className={styles.pane}>
      <GrammarSummary count={remaining.length} stats={data.stats} />
      <GrammarNotes notes={remaining} onResolve={onResolve} />
    </div>
  );
}
