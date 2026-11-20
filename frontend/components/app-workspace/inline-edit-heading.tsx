import { useT } from "@/components/i18n/i18n-provider";
import styles from "./workspace-styles";

export function InlineEditHeading({ onClose }: { onClose: () => void }) {
  const { t } = useT();
  return (
    <div className={styles.barHead}>
      <strong>{t("appWorkspace.inline.label")}</strong>
      <button
        type="button"
        aria-label={t("appWorkspace.inline.close")}
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}
