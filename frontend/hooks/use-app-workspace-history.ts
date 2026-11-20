"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useT } from "@/components/i18n/i18n-provider";
import { getVersionDiff, restoreVersion } from "@/lib/app-api/history";
import type { VersionDiffResult } from "@/lib/app-api/history.types";

export function useAppWorkspaceHistory(jobId: string) {
  const [diff, setDiff] = useState<VersionDiffResult | null>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const [restoring, setRestoring] = useState(false);
  const { t } = useT();
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
        setLoadError(t("appWorkspace.history.unavailable"));
        return;
      }
      setDiff(changes);
    } catch {
      setDiff(null);
      setLoadError(t("appWorkspace.history.unavailable"));
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
      setLoadError(t("appWorkspace.history.restoreFailed"));
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
