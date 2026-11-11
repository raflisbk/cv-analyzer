import HelpButton from "@/components/pathy/help-button";
import type { WorkspaceFix } from "@/lib/app-workspace/fixes";
import { FixCard } from "./fix-card";
import styles from "../workspace-styles";

export function FixesPane({
  fixes,
  onApply,
}: {
  fixes: WorkspaceFix[];
  onApply: (fix: WorkspaceFix, text: string, anchor: HTMLElement) => boolean;
}) {
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
            onApply={(text, anchor) => onApply(fix, text, anchor)}
          />
        ))
      ) : (
        <p>All fixes reviewed. Your CV is ready for another look.</p>
      )}
    </div>
  );
}
