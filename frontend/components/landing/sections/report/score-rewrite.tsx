import PenStrike from "../../pen/pen-strike";
import PenHighlight from "../../pen/pen-highlight";
import styles from "./report.module.css";

export default function ScoreRewrite() {
  return (
    <div data-rewrite className={styles.rewrite}>
      <span className={styles.flag}>No number</span>
      <span className={styles.before}>
        Led a team of developers on the checkout rebuild.
        <PenStrike variant={0} delay={0.2} />
      </span>
      <strong className={styles.after}>
        Led the checkout rebuild with a team of developers.
        <PenHighlight variant={1} delay={0.4} onDark />
      </strong>
      <span className={styles.chip}>Accept rewrite</span>
    </div>
  );
}
