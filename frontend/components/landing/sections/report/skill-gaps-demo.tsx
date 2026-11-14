import styles from "./support.module.css";

export default function SkillGapsDemo() {
  return (
    <div className={styles.gaps} aria-label="Missing skills">
      <span>Missing from this CV</span>
      <div>
        <span>SQL</span>
        <span>A/B testing</span>
      </div>
    </div>
  );
}
