import HelpButton from "@/components/pathy/help-button";
import LoadingSkeleton from "@/components/app-shell/loading-skeleton";
import type { WorkspaceFix } from "@/lib/app-workspace/fixes";
import { FixCard } from "./fix-card";
import styles from "../workspace-styles";

export function FixesPane({
  fixes,
  error,
  loading,
  retry,
  onApply,
}: {
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
}) {
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
      {fixes.length ? (
        fixes.map((fix) => (
          <FixCard
            key={fix.id}
            fix={fix}
            onApply={(text, anchor, answers) =>
              onApply(fix, text, anchor, answers)
            }
          />
        ))
      ) : (
        <p>All fixes reviewed. Your CV is ready for another look.</p>
      )}
    </div>
  );
}
