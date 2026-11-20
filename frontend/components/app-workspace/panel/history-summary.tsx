import Image from "next/image";
import { useT } from "@/components/i18n/i18n-provider";
import HelpButton from "@/components/pathy/help-button";
import { pathyPoseSrc } from "@/lib/pathy/pose";
import styles from "../workspace-styles";

export function HistorySummary({ count }: { count: number }) {
  const { t } = useT();
  return (
    <div className={styles.paneHead}>
      <Image
        className={styles.pathy}
        src={pathyPoseSrc("think")}
        alt=""
        width={72}
        height={72}
      />
      <div>
        <div className={styles.row}>
          <span className={styles.eyebrow}>
            {t("appWorkspacePanel.history.title")}
          </span>
          <HelpButton helpKey="historyTab" />
        </div>
        <h2>{t("appWorkspacePanel.history.saved", { count })}</h2>
        <p className={styles.muted}>{t("appWorkspacePanel.history.hint")}</p>
      </div>
    </div>
  );
}
