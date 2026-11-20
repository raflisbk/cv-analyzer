import Image from "next/image";
import { useT } from "@/components/i18n/i18n-provider";
import HelpButton from "@/components/pathy/help-button";
import { pathyPoseSrc } from "@/lib/pathy/pose";
import styles from "../workspace-styles";

export function JobMatchIntro() {
  const { t } = useT();
  return (
    <div className={styles.paneHead}>
      <Image
        className={styles.pathy}
        src={pathyPoseSrc("map")}
        alt=""
        width={72}
        height={72}
      />
      <div>
        <div className={styles.row}>
          <span className={styles.eyebrow}>
            {t("appWorkspacePanel.match.title")}
          </span>
          <HelpButton helpKey="match" />
        </div>
        <h2>{t("appWorkspacePanel.match.heading")}</h2>
        <p className={styles.muted}>{t("appWorkspacePanel.match.hint")}</p>
      </div>
    </div>
  );
}
