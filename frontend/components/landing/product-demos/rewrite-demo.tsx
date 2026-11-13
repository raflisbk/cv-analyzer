import { demoRewrite } from "@/lib/landing-stickers";
import styles from "./demos.module.css";

export default function RewriteDemo() {
  return (
    <div className={styles.rewrite}>
      <span className={styles.tag}>No number</span>
      <s data-demo-before>{demoRewrite.before}</s>
      <strong data-demo-after>{demoRewrite.after}</strong>
      <button
        type="button"
        disabled
        className={styles.accept}
        aria-label="Sample accepted rewrite"
      >
        Accept rewrite ✓
      </button>
    </div>
  );
}
