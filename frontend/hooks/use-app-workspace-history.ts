"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getVersionDiff, restoreVersion } from "@/lib/app-api/history";
import type { VersionDiffResult } from "@/lib/app-api/history.types";

export function useAppWorkspaceHistory(jobId: string) {
  const [diff, setDiff] = useState<VersionDiffResult | null>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const [restoring, setRestoring] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
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
  async function restore() {
    if (!restoreId || restoring) return;
    try {
      setLoadError("");
      setRestoring(true);
      const created = await restoreVersion(jobId, restoreId);
      await Promise.all(
        ["app-history", "job-results", "app-workspace"].map((key) =>
          queryClient.invalidateQueries({ queryKey: [key, jobId] }),
        ),
      );
      setRestoreId(null);
      router.push(`/app/cvs/${created.jobId}?view=editor&tab=history`);
    } catch {
      setLoadError("Could not restore this version. Try again.");
    } finally {
      setRestoring(false);
    }
  }
  return {
    diff,
    restoreId,
    restoring,
    loadError,
    compare,
    setRestoreId,
    restore,
  };
}
