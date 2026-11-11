import type { VersionDiff } from "@/lib/app-api/history.types";
import styles from "../workspace-styles";

export function HistoryDiff({ diff }: { diff: VersionDiff[] | null }) {
  if (!diff) {
    return null;
  }
  return (
    <section>
      <h3 className={styles.eyebrow}>Changes</h3>
      {diff.map((change, index) => (
        <div className={styles.card} key={index}>
          <s>{change.before}</s>
          <strong>{change.after}</strong>
        </div>
      ))}
    </section>
  );
}
