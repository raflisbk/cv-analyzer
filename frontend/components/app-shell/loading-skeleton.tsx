import styles from "./loading-skeleton.module.css";

export default function LoadingSkeleton({ label }: { label: string }) {
  return (
    <div className={styles.skeleton} role="status" aria-label={label}>
      <p className={styles.label}>{label}…</p>
      <span />
      <span />
      <span />
    </div>
  );
}
