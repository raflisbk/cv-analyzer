import Image from "next/image";
import { useT } from "@/components/i18n/i18n-provider";
import HelpButton from "@/components/pathy/help-button";
import { pathyPoseSrc } from "@/lib/pathy/pose";
import type { AtsData } from "@/lib/app-api/ats.types";
import styles from "../workspace-styles";

export function AtsIntro({
  score,
  summary,
}: Pick<AtsData, "score" | "summary">) {
  const { t } = useT();
  return (
    <div className={styles.paneHead}>
      <Image
        className={styles.pathy}
        src={pathyPoseSrc("detective")}
        alt=""
        width={72}
        height={72}
      />
      <div>
        <div className={styles.row}>
          <span className={styles.eyebrow}>
            {t("appWorkspacePanel.ats.title")}
          </span>
          <HelpButton helpKey="ats" />
        </div>
        <h2>{t("appWorkspacePanel.ats.ready", { score })}</h2>
        <p className={styles.muted}>{summary}</p>
      </div>
    </div>
  );
}
