import type { ExportTemplate } from "@/lib/app-api/export.types";
import { exportFilename } from "@/lib/app-export/download";
import styles from "./export-options.module.css";
import ExportOptionDetails from "./export-option-details";
import ExportOptionActions from "./export-option-actions";

interface Props {
  template: ExportTemplate;
  fileName: string;
  downloading: boolean;
  error: string | null;
  resultMessage: string | null;
  onDownload: (anchor: HTMLElement) => void;
  onCancel: () => void;
}

export default function ExportOptions({
  template,
  fileName,
  downloading,
  error,
  resultMessage,
  onDownload,
  onCancel,
}: Props) {
  const format =
    template.original && fileName.toLowerCase().endsWith(".docx")
      ? "DOCX"
      : "PDF";
  return (
    <aside className={styles.side}>
      <ExportOptionDetails template={template} format={format} />
      <ExportOptionActions
        fileName={exportFilename(fileName, template.id)}
        format={format}
        downloading={downloading}
        error={error}
        resultMessage={resultMessage}
        onDownload={onDownload}
        onCancel={onCancel}
      />
    </aside>
  );
}
