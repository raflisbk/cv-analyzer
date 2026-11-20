import { useT } from "@/components/i18n/i18n-provider";
import type { useAppExport } from "@/hooks/use-app-export";
import LoadingSkeleton from "@/components/app-shell/loading-skeleton";
import ExportDialogReady from "./export-dialog-ready";

type State = ReturnType<typeof useAppExport>;

export default function ExportDialogContent({
  state,
  onClose,
}: {
  state: State;
  onClose: () => void;
}) {
  const { t } = useT();
  if (state.templates.isLoading || state.preview.isLoading) {
    return <LoadingSkeleton label={t("appExport.loading")} />;
  }
  if (state.templates.isError || state.preview.isError) {
    return (
      <p role="alert">
        {t("appExport.loadError")}{" "}
        <button
          type="button"
          onClick={() => {
            void state.templates.refetch();
            void state.preview.refetch();
          }}
        >
          {t("appExport.retry")}
        </button>
      </p>
    );
  }
  return <ExportDialogReady state={state} onClose={onClose} />;
}
