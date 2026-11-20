import { useT } from "@/components/i18n/i18n-provider";
import HelpButton from "@/components/pathy/help-button";
import LoadingSkeleton from "@/components/app-shell/loading-skeleton";
import type { WorkspaceFix } from "@/lib/app-workspace/fixes";
import { FixCardList } from "./fix-card-list";
import styles from "../workspace-styles";

interface Props {
  fixes: WorkspaceFix[];
  error?: boolean;
  loading?: boolean;
  retry?: () => void;
  onShow?: (id: string, section: string) => void;
  onApply: (
    fix: WorkspaceFix,
    text: string,
    anchor: HTMLElement,
    answers: Record<string, string>,
  ) => boolean;
}

export function FixesPane({
  fixes,
  error,
  loading,
  retry,
  onApply,
  onShow,
}: Props) {
  const { t } = useT();
  if (error) {
    return (
      <div role="alert">
        {t("appWorkspacePanel.fixes.error")}{" "}
        <button type="button" onClick={retry}>
          {t("appWorkspacePanel.retry")}
        </button>
      </div>
    );
  }
  if (loading) {
    return <LoadingSkeleton label={t("appWorkspacePanel.fixes.loading")} />;
  }
  return (
    <div className={styles.pane}>
      <div className={styles.row}>
        <span className={styles.eyebrow}>
          {t("appWorkspacePanel.fixes.title")}
        </span>
        <HelpButton helpKey="paneFixes" />
      </div>
      <FixCardList fixes={fixes} onApply={onApply} onShow={onShow} />
    </div>
  );
}
