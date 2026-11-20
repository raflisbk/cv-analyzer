import { useT } from "@/components/i18n/i18n-provider";
import LoadingSkeleton from "@/components/app-shell/loading-skeleton";

export function ReportStatus({
  error,
  retry,
}: {
  error?: boolean;
  retry?: () => void;
}) {
  const { t } = useT();
  return error ? (
    <div role="alert">
      {t("appWorkspacePanel.report.error")}{" "}
      <button type="button" onClick={retry}>
        {t("appWorkspacePanel.retry")}
      </button>
    </div>
  ) : (
    <LoadingSkeleton label={t("appWorkspacePanel.report.processing")} />
  );
}
