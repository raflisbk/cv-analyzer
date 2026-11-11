import styles from "./workspace-styles";

export function WorkspaceBack() {
  return (
    <button
      type="button"
      className={`${styles.pill} ${styles.snow}`}
      aria-label="Back to My CVs"
      onClick={() => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.assign("/app/cvs");
        }
      }}
    >
      ←
    </button>
  );
}
