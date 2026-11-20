import Image from "next/image";
import { useT } from "@/components/i18n/i18n-provider";
import HelpButton from "@/components/pathy/help-button";
import { pathyPoseSrc } from "@/lib/pathy/pose";
import type { GrammarData } from "@/lib/app-api/grammar.types";
import styles from "../workspace-styles";

interface Props {
  count: number;
  stats: GrammarData["stats"];
}

export function GrammarSummary({ count, stats }: Props) {
  const { t } = useT();
  return (
    <>
      <div className={styles.paneHead}>
        <Image
          className={styles.pathy}
          src={pathyPoseSrc(count ? "surprised" : "love")}
          alt=""
          width={72}
          height={72}
        />
        <div>
          <div className={styles.row}>
            <span className={styles.eyebrow}>
              {t("appWorkspacePanel.grammar.title")}
            </span>
            <HelpButton helpKey="grammarTab" />
          </div>
          <h2>
            {count
              ? t(
                  count === 1
                    ? "appWorkspacePanel.grammar.one"
                    : "appWorkspacePanel.grammar.many",
                  { count },
                )
              : t("appWorkspacePanel.grammar.clean")}
          </h2>
          <p className={styles.muted}>{t("appWorkspacePanel.grammar.hint")}</p>
        </div>
      </div>
      <div className={styles.statGrid}>
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className={styles.stat}>
            <b>{value}</b>
            <span>{t(`appWorkspacePanel.grammar.${key}`)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
