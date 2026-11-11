import styles from "../workspace-styles";

export function JobMatchForm({
  description,
  setDescription,
  runMatch,
}: {
  description: string;
  setDescription: (value: string) => void;
  runMatch: () => void;
}) {
  return (
    <>
      <label htmlFor="job-description">Job description</label>
      <textarea
        id="job-description"
        className={styles.textarea}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <button
        type="button"
        className={`${styles.pill} ${styles.punk}`}
        onClick={runMatch}
      >
        Match with my CV
      </button>
    </>
  );
}
