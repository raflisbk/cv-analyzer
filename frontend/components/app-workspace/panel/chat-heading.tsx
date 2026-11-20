import { useT } from "@/components/i18n/i18n-provider";
import HelpButton from "@/components/pathy/help-button";
import styles from "../workspace-styles";

export function ChatHeading({ fileName }: { fileName: string }) {
  const { t } = useT();
  return (
    <div className={styles.row}>
      <span className={styles.eyebrow}>
        {t("appWorkspacePanel.chat.heading", { file: fileName })}
      </span>
      <HelpButton helpKey="chat" />
    </div>
  );
}
