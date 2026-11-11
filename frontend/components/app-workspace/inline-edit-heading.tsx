import styles from "./workspace-styles";

export function InlineEditHeading({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.barHead}>
      <strong>Edit with AI</strong>
      <button type="button" aria-label="Close" onClick={onClose}>
        ×
      </button>
    </div>
  );
}
