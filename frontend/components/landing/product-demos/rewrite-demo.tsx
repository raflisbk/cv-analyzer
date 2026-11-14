import { demoRewrite } from "@/lib/landing-stickers";
import styles from "./demos.module.css";
import PenStrike from "../pen/pen-strike";
import PenHighlight from "../pen/pen-highlight";

export default function RewriteDemo() {
  return (
    <div className={styles.rewrite}>
      <span className={styles.tag}>No number</span>
      <span data-demo-before className={styles.rewriteLine}>
        {demoRewrite.before}
        <PenStrike play={false} />
      </span>
      <strong data-demo-after className={styles.rewriteLine}>
        {demoRewrite.after}
        <PenHighlight play={false} />
      </strong>
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
