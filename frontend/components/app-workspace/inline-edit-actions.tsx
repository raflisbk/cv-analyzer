import { useT } from "@/components/i18n/i18n-provider";
import styles from "./workspace-styles";

export function InlineEditActions({
  accept,
  retry,
}: {
  accept: () => void;
  retry: () => void;
}) {
  const { t } = useT();
  return (
    <div className={styles.row}>
      <button
        type="button"
        className={`${styles.pill} ${styles.punk}`}
        onClick={accept}
      >
        {t("appWorkspace.inline.accept")}
      </button>
      <button
        type="button"
        className={`${styles.pill} ${styles.snow}`}
        onClick={retry}
      >
        {t("appWorkspace.inline.another")}
      </button>
    </div>
  );
}
