import { useT } from "@/components/i18n/i18n-provider";
import styles from "./workspace-styles";

export function WorkspaceBack() {
  const { t } = useT();
  return (
    <button
      type="button"
      className={`${styles.pill} ${styles.snow}`}
      aria-label={t("appWorkspace.back")}
      onClick={() => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.assign("/app/cvs");
        }
      }}
    >
      ←
    </button>
  );
}
