import styles from "../workspace-styles";

export function JobSkillConfirm({
  skill,
  onConfirm,
  onCancel,
}: {
  skill: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className={styles.card}>
      <strong>Have you used {skill} in your work?</strong>
      <p>Add it only if you can speak about this experience.</p>
      <div className={styles.row}>
        <button
          type="button"
          className={`${styles.pill} ${styles.punk}`}
          onClick={onConfirm}
        >
          Yes, add to Skills
        </button>
        <button
          type="button"
          className={`${styles.pill} ${styles.snow}`}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
