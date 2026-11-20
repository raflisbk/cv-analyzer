import { useT } from "@/components/i18n/i18n-provider";
import styles from "../workspace-styles";

export function ReportChecks({ fixCount }: { fixCount: number }) {
  const { t } = useT();
  return (
    <>
      <div className={styles.check}>
        <span className={styles.checkIcon}>✓</span>
        {t("appWorkspacePanel.report.checkStructure")}
      </div>
      <div className={styles.check}>
        <span className={styles.checkIcon}>✓</span>
        {t("appWorkspacePanel.report.checkSkills")}
      </div>
      <div className={styles.check}>
        <span className={styles.checkIcon}>!</span>
        {t("appWorkspacePanel.report.fixesLeft", { count: fixCount })}
      </div>
    </>
  );
}
