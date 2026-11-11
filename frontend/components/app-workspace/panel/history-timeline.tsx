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
        <p>No versions have been saved yet.</p>
      )}
      <div className={styles.group}>
        <strong>Autosave</strong>
        <p>Draft saved automatically.</p>
      </div>
    </>
  );
}
