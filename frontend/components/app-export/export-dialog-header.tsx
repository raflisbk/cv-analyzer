import Image from "next/image";
import { useT } from "@/components/i18n/i18n-provider";
import HelpButton from "@/components/pathy/help-button";
import styles from "./export-dialog.module.css";

export default function ExportDialogHeader({
  onClose,
}: {
  onClose: () => void;
}) {
  const { t } = useT();
  return (
    <header className={styles.header}>
      <div>
        <span>{t("appExport.title")}</span>
        <h2 id="export-title">
          {t("appExport.heading")} <HelpButton helpKey="exportHelp" />
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
        aria-label={t("appExport.close")}
        onClick={onClose}
      >
        ×
      </button>
    </header>
  );
}
