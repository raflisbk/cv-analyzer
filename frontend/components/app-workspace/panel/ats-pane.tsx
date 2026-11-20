import { useT } from "@/components/i18n/i18n-provider";
import type { AtsData } from "@/lib/app-api/ats.types";
import LoadingSkeleton from "@/components/app-shell/loading-skeleton";
import { AtsCompat } from "./ats-compat";
import { AtsChecks } from "./ats-checks";
import { AtsIntro } from "./ats-intro";
import styles from "../workspace-styles";

export function AtsPane({
  data,
  error,
  retry,
  onExport,
}: {
  data?: AtsData;
  error?: Error | null;
  retry?: () => void;
  onExport: () => void;
}) {
  const { t } = useT();
  if (error) {
    return (
      <div role="alert">
        {t("appWorkspacePanel.ats.error")}{" "}
        <button type="button" onClick={retry}>
          {t("appWorkspacePanel.retry")}
        </button>
      </div>
    );
  }
  if (!data) {
    return <LoadingSkeleton label={t("appWorkspacePanel.ats.loading")} />;
  }
  return (
    <div className={styles.pane}>
      <AtsIntro score={data.score} summary={data.summary} />
      <AtsCompat data={data} />
      <AtsChecks data={data} />
      <button
        type="button"
        className={`${styles.pill} ${styles.punk}`}
        onClick={onExport}
      >
        {t("appWorkspacePanel.ats.switch")}
      </button>
    </div>
  );
}
