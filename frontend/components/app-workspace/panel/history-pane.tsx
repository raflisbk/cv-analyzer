"use client";

import { useT } from "@/components/i18n/i18n-provider";
import type { VersionData } from "@/lib/app-api/history.types";
import LoadingSkeleton from "@/components/app-shell/loading-skeleton";
import { useAppWorkspaceHistory } from "@/hooks/use-app-workspace-history";
import { HistoryContent } from "./history-content";

export function HistoryPane({
  jobId,
  versions,
  error,
  retry,
}: {
  jobId: string;
  versions?: VersionData[];
  error?: Error | null;
  retry?: () => void;
}) {
  const { t } = useT();
  const history = useAppWorkspaceHistory(jobId);
  if (error) {
    return (
      <div role="alert">
        {t("appWorkspacePanel.history.error")}{" "}
        <button type="button" onClick={retry}>
          {t("appWorkspacePanel.retry")}
        </button>
      </div>
    );
  }
  if (!versions) {
    return <LoadingSkeleton label={t("appWorkspacePanel.history.loading")} />;
  }
  return <HistoryContent versions={versions} history={history} />;
}
