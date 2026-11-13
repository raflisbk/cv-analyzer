"use client";

import { useState } from "react";
import { getVersionDiff } from "@/lib/app-api/history";
import type { VersionDiff } from "@/lib/app-api/history.types";

export function useAppWorkspaceHistory(jobId: string) {
  const [diff, setDiff] = useState<VersionDiff | null>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  async function compare(versionId: string) {
    try {
      setLoadError("");
      setDiff(await getVersionDiff(jobId, versionId));
    } catch {
      setLoadError("Changes could not load.");
    }
  }
  function restore() {
    setLoadError(
      "Restore preview confirmed. Saving restored drafts is coming soon.",
    );
    setRestoreId(null);
  }
  return { diff, restoreId, loadError, compare, setRestoreId, restore };
}
