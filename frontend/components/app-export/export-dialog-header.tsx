import Image from "next/image";
import HelpButton from "@/components/pathy/help-button";
import styles from "./export-dialog.module.css";

export default function ExportDialogHeader({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <header className={styles.header}>
      <div>
        <span>Export</span>
        <h2 id="export-title">
          Choose an ATS template <HelpButton helpKey="exportHelp" />
        </h2>
      </div>
      <Image
        className={styles.pathy}
        src="/pathy/helpdesk.webp"
        alt=""
        width={74}
        height={90}
      />
      <button
        className={styles.close}
        type="button"
        aria-label="Close export"
        onClick={onClose}
      >
        ×
      </button>
    </header>
  );
}
