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
  if (state.templates.isLoading || state.preview.isLoading) {
    return <LoadingSkeleton label="Loading export preview" />;
  }
  if (state.templates.isError || state.preview.isError) {
    return (
      <p role="alert">
        Could not load export options.{" "}
        <button
          type="button"
          onClick={() => {
            void state.templates.refetch();
            void state.preview.refetch();
          }}
        >
          Try again
        </button>
      </p>
    );
  }
  return <ExportDialogReady state={state} onClose={onClose} />;
}
