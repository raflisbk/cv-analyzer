import { useT } from "@/components/i18n/i18n-provider";
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
  const { t } = useT();
  return (
    <>
      <label htmlFor="job-description">
        {t("appWorkspacePanel.match.description")}
      </label>
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
        {t("appWorkspacePanel.match.run")}
      </button>
    </>
  );
}
