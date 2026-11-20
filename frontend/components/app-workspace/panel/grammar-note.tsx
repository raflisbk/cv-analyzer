import { useT } from "@/components/i18n/i18n-provider";
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
  const { t } = useT();
  const type = t(`appWorkspacePanel.grammar.${note.type}`);
  return (
    <article className={styles.card}>
      <div className={styles.row}>
        <span className={styles.eyebrow}>{type}</span>
        <span>{note.location}</span>
      </div>
      <p>
        <s>{note.before}</s> → <strong>{note.after}</strong>
      </p>
      <div className={styles.row}>
        <button
          type="button"
          aria-label={t("appWorkspacePanel.grammar.acceptLabel", {
            type,
            before: note.before,
            after: note.after,
          })}
          className={`${styles.pill} ${styles.punk}`}
          onClick={() => onResolve("accept")}
        >
          {t("appWorkspacePanel.grammar.accept")}
        </button>
        <button
          type="button"
          aria-label={t("appWorkspacePanel.grammar.ignoreLabel", {
            type,
            before: note.before,
          })}
          className={`${styles.pill} ${styles.snow}`}
          onClick={() => onResolve("ignore")}
        >
          {t("appWorkspacePanel.grammar.ignore")}
        </button>
      </div>
    </article>
  );
}
