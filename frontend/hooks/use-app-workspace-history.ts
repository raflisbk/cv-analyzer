"use client";

import { useState } from "react";
import { getVersionDiff } from "@/lib/app-api/history";
import type { VersionDiffResult } from "@/lib/app-api/history.types";

export function useAppWorkspaceHistory(jobId: string) {
  const [diff, setDiff] = useState<VersionDiffResult | null>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  async function compare(versionId: string) {
    try {
      setLoadError("");
      const changes = await getVersionDiff(jobId, versionId);
      if (
        !changes ||
        (Array.isArray(changes) && !changes.length) ||
        (!Array.isArray(changes) && !changes.before && !changes.after)
      ) {
        setDiff(null);
        setLoadError("Version text is unavailable for comparison.");
        return;
      }
      setDiff(changes);
    } catch {
      setDiff(null);
      setLoadError("Version text is unavailable for comparison.");
    }
  }
  function restore() {
    setLoadError(
      "Restore is unavailable because version text cannot be loaded.",
    );
    setRestoreId(null);
  }
  return { diff, restoreId, loadError, compare, setRestoreId, restore };
}
