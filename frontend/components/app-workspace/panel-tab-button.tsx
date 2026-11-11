import type { WorkspaceTab } from "./workspace-panel";
import styles from "./workspace-styles";

export function PanelTabButton({
  value,
  label,
  selected,
  fixCount,
  grammarCount,
  onClick,
  onKeyDown,
}: {
  value: WorkspaceTab;
  label: string;
  selected: boolean;
  fixCount: number;
  grammarCount: number;
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      id={`tab-${value}`}
      className={styles.tab}
      type="button"
      role="tab"
      aria-controls={`pane-${value}`}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {label}
      {value === "fixes" && <span className={styles.count}>{fixCount}</span>}
      {value === "grammar" && (
        <span className={styles.count}>{grammarCount}</span>
      )}
    </button>
  );
}
