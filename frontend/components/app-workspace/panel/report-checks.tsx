import styles from "../workspace-styles";

export function ReportChecks({ fixCount }: { fixCount: number }) {
  return (
    <>
      <div className={styles.check}>
        <span className={styles.checkIcon}>✓</span>Clear, readable structure
      </div>
      <div className={styles.check}>
        <span className={styles.checkIcon}>✓</span>Skills match the target role
      </div>
      <div className={styles.check}>
        <span className={styles.checkIcon}>!</span>
        {fixCount} fixes left to review
      </div>
    </>
  );
}
