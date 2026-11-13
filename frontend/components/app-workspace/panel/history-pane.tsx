"use client";

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
  const history = useAppWorkspaceHistory(jobId);
  if (error) {
    return (
      <div role="alert">
        Version history could not load.{" "}
        <button type="button" onClick={retry}>
          Try again
        </button>
      </div>
    );
  }
  if (!versions) {
    return <LoadingSkeleton label="Loading versions" />;
  }
  return <HistoryContent versions={versions} history={history} />;
}
