import { useT } from "@/components/i18n/i18n-provider";
import type { VersionDiffResult } from "@/lib/app-api/history.types";
import styles from "../workspace-styles";

export function HistoryDiff({ diff }: { diff: VersionDiffResult | null }) {
  const { t } = useT();
  if (!diff) {
    return null;
  }
  const changes = Array.isArray(diff) ? diff : [diff];
  return (
    <section>
      <h3 className={styles.eyebrow}>
        {t("appWorkspacePanel.history.diffTitle")}
      </h3>
      {changes.map((change, index) => (
        <div className={styles.card} key={index}>
          <s>{change.before}</s>
          <strong>{change.after}</strong>
        </div>
      ))}
    </section>
  );
}
