import type { VersionDiff } from "@/lib/app-api/history.types";
import styles from "../workspace-styles";

export function HistoryDiff({ diff }: { diff: VersionDiff | null }) {
  if (!diff) {
    return null;
  }
  return (
    <section>
      <h3 className={styles.eyebrow}>Changes</h3>
      <div className={styles.card}>
        <s>{diff.before}</s>
        <strong>{diff.after}</strong>
      </div>
    </section>
  );
}
