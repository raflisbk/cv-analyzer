import styles from "./workspace-styles";

export function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className={styles.bar}>
      <div className={styles.barHead}>
        <span>{label}</span>
        <span>{score}</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
