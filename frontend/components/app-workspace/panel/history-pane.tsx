"use client";

import { useState } from "react";
import { getVersionDiff } from "@/lib/app-api/history";
import type { VersionData, VersionDiff } from "@/lib/app-api/history.types";
import { HistoryVersionCard } from "./history-version-card";
import { HistoryRestoreDialog } from "./history-restore-dialog";
import { HistorySummary } from "./history-summary";
import styles from "../workspace-styles";

export function HistoryPane({
  jobId,
  versions,
  error,
}: {
  jobId: string;
  versions?: VersionData[];
  error?: Error | null;
}) {
  const [diff, setDiff] = useState<VersionDiff[] | null>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  if (error) {
    return (
      <div role="alert">Version history could not load. Try again later.</div>
    );
  }
  if (!versions) {
    return <div role="status">Loading versions…</div>;
  }
  async function compare(versionId: string) {
    try {
      setLoadError("");
      setDiff(await getVersionDiff(jobId, versionId));
    } catch {
      setLoadError("Changes could not load.");
    }
  }
  return (
    <div className={styles.pane}>
      <HistorySummary count={versions.length} />
      {versions.length ? (
        versions.map((version) => (
          <HistoryVersionCard
            key={version.id}
            version={version}
            onCompare={() => void compare(version.id)}
            onRestore={() => setRestoreId(version.id)}
          />
        ))
      ) : (
        <p>No versions have been saved yet.</p>
      )}
      <div className={styles.group}>
        <strong>Autosave</strong>
        <p>Draft saved automatically.</p>
      </div>
      {loadError && <p role="alert">{loadError}</p>}
      {diff && (
        <section>
          <h3 className={styles.eyebrow}>Changes</h3>
          {diff.map((change, index) => (
            <div className={styles.card} key={index}>
              <s>{change.before}</s>
              <strong>{change.after}</strong>
            </div>
          ))}
        </section>
      )}
      {restoreId && (
        <HistoryRestoreDialog
          versionId={restoreId}
          onCancel={() => setRestoreId(null)}
          onRestore={() => {
            setLoadError(
              "Restore preview confirmed. Saving restored drafts is coming soon.",
            );
            setRestoreId(null);
          }}
        />
      )}
    </div>
  );
}
