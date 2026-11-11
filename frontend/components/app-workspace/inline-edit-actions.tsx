import styles from "./workspace-styles";

export function InlineEditActions({
  accept,
  retry,
}: {
  accept: () => void;
  retry: () => void;
}) {
  return (
    <div className={styles.row}>
      <button
        type="button"
        className={`${styles.pill} ${styles.punk}`}
        onClick={accept}
      >
        Accept
      </button>
      <button
        type="button"
        className={`${styles.pill} ${styles.snow}`}
        onClick={retry}
      >
        Try another
      </button>
    </div>
  );
}
