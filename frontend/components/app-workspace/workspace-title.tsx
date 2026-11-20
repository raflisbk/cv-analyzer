import { useT } from "@/components/i18n/i18n-provider";
import styles from "./workspace-styles";

export function WorkspaceTitle({
  name,
  role,
  version,
  saveState,
}: {
  name: string;
  role: string;
  version?: string;
  saveState: string;
}) {
  const { t } = useT();
  const status =
    saveState === "saving"
      ? t("appWorkspace.saving")
      : saveState === "error"
        ? t("appWorkspace.saveFailed")
        : t("appWorkspace.saved");
  return (
    <div className={styles.name}>
      <div className={styles.crumb}>{t("appWorkspace.crumb")}</div>
      <h1 className={styles.title}>{name}</h1>
      <div className={styles.sub}>
        {[role.trim(), version?.trim(), status].filter(Boolean).join(" · ")}
      </div>
    </div>
  );
}
