import { useT } from "@/components/i18n/i18n-provider";
import type { VersionData } from "@/lib/app-api/history.types";
import { HistoryVersionCard } from "./history-version-card";
import styles from "../workspace-styles";

export function HistoryTimeline({
  versions,
  onCompare,
  onRestore,
}: {
  versions: VersionData[];
  onCompare: (id: string) => void;
  onRestore: (id: string) => void;
}) {
  const { t } = useT();
  return (
    <>
      {versions.length ? (
        versions.map((version) => (
          <HistoryVersionCard
            key={version.id}
            version={version}
            onCompare={() => onCompare(version.id)}
            onRestore={() => onRestore(version.id)}
          />
        ))
      ) : (
        <p>{t("appWorkspacePanel.history.none")}</p>
      )}
      <div className={styles.group}>
        <strong>{t("appWorkspacePanel.history.autosave")}</strong>
        <p>{t("appWorkspacePanel.history.autosaveBody")}</p>
      </div>
    </>
  );
}
