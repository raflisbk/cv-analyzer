import { useT } from "@/components/i18n/i18n-provider";
import styles from "../workspace-styles";

export function JobSkillConfirm({
  skill,
  onConfirm,
  onCancel,
}: {
  skill: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useT();
  return (
    <div className={styles.card}>
      <strong>{t("appWorkspacePanel.match.confirmTitle", { skill })}</strong>
      <p>{t("appWorkspacePanel.match.confirmBody")}</p>
      <div className={styles.row}>
        <button
          type="button"
          className={`${styles.pill} ${styles.punk}`}
          onClick={onConfirm}
        >
          {t("appWorkspacePanel.match.confirmYes")}
        </button>
        <button
          type="button"
          className={`${styles.pill} ${styles.snow}`}
          onClick={onCancel}
        >
          {t("appWorkspacePanel.match.cancel")}
        </button>
      </div>
    </div>
  );
}
