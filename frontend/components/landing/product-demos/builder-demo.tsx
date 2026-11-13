import styles from "./document-demos.module.css";

export default function BuilderDemo() {
  return (
    <div
      className={styles.builder}
      role="img"
      aria-label="Blank CV page with profile, experience and skills sections ready to fill"
    >
      <span>
        YOUR NAME
        <span className={styles.caret} />
      </span>
      {["Profile", "Experience", "Skills"].map((section) => (
        <div className={styles.skeleton} key={section}>
          <strong>{section}</strong>
          <i />
          <i />
        </div>
      ))}
    </div>
  );
}
