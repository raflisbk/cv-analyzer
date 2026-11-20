import { useT } from "@/components/i18n/i18n-provider";
import type { AtsData } from "@/lib/app-api/ats.types";
import { AtsPlainText } from "./ats-plain-text";
import { AtsCheckGroups } from "./ats-check-groups";
import styles from "../workspace-styles";

export function AtsChecks({ data }: { data: AtsData }) {
  const { t } = useT();
  return (
    <>
      <AtsPlainText plainText={data.plainText} />
      <AtsCheckGroups checks={data.checks} />
      <div className={styles.check}>
        <span className={styles.checkIcon}>
          {data.hiddenText.found ? "!" : "✓"}
        </span>
        {data.hiddenText.found
          ? t("appWorkspacePanel.ats.hidden", {
              items: data.hiddenText.items.join(", "),
            })
          : t("appWorkspacePanel.ats.noHidden")}
      </div>
    </>
  );
}
