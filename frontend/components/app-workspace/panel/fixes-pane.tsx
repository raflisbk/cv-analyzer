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
  onApply: (
    fix: WorkspaceFix,
    text: string,
    anchor: HTMLElement,
    answers: Record<string, string>,
  ) => boolean;
}

export function FixesPane({ fixes, error, loading, retry, onApply }: Props) {
  if (error) {
    return (
      <div role="alert">
        Fixes could not load.{" "}
        <button type="button" onClick={retry}>
          Try again
        </button>
      </div>
    );
  }
  if (loading) {
    return <LoadingSkeleton label="Loading suggested fixes" />;
  }
  return (
    <div className={styles.pane}>
      <div className={styles.row}>
        <span className={styles.eyebrow}>Suggested fixes</span>
        <HelpButton helpKey="paneFixes" />
      </div>
      <FixCardList fixes={fixes} onApply={onApply} />
    </div>
  );
}
