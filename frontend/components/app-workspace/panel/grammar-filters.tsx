import { useT } from "@/components/i18n/i18n-provider";
import type { GrammarData } from "@/lib/app-api/grammar.types";
import styles from "../workspace-styles";

export type GrammarFilter = "all" | "spelling" | "grammar" | "style";
export function GrammarFilters({
  filter,
  setFilter,
  notes,
}: {
  filter: GrammarFilter;
  setFilter: (filter: GrammarFilter) => void;
  notes: GrammarData["notes"];
}) {
  const { t } = useT();
  return (
    <div className={styles.row}>
      {(["all", "spelling", "grammar", "style"] as const).map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={filter === item}
          className={styles.filter}
          onClick={() => setFilter(item)}
        >
          {t(`appWorkspacePanel.grammar.${item}`)}{" "}
          {notes.filter((note) => item === "all" || note.type === item).length}
        </button>
      ))}
    </div>
  );
}
