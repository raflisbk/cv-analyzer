import { useT } from "@/components/i18n/i18n-provider";
import type { useAppExport } from "@/hooks/use-app-export";
import TemplateList from "./template-list";
import ExportPreview from "./export-preview";
import ExportOptions from "./export-options";
import styles from "./export-dialog.module.css";

type State = ReturnType<typeof useAppExport>;

export default function ExportDialogReady({
  state,
  onClose,
}: {
  state: State;
  onClose: () => void;
}) {
  const { t } = useT();
  if (!state.selected || !state.preview.data || !state.templates.data) {
    return <p role="status">{t("appExport.noTemplates")}</p>;
  }
  return (
    <div className={styles.body}>
      <TemplateList
        templates={state.templates.data}
        selectedId={state.selectedId}
        onSelect={state.setSelectedId}
      />
      {state.selected.original && state.originalFile.isLoading ? (
        <p role="status">{t("appExport.checkingOriginal")}</p>
      ) : state.selected.original && state.originalFile.isError ? (
        <p role="alert">{t("appExport.originalMissing")}</p>
      ) : (
        <>
          <ExportPreview template={state.selected} data={state.preview.data} />
          <ExportOptions
            template={state.selected}
            fileName={state.preview.data.fileName}
            downloading={state.downloading}
            error={state.error}
            resultMessage={state.resultMessage}
            reasons={state.reasons}
            onDownload={state.download}
            onCancel={onClose}
          />
        </>
      )}
    </div>
  );
}
