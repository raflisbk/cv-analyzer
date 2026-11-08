import styles from "./paper.module.css";

export default function CvSidebar() {
  return (
    <aside className={styles.sidebar}>
      <section data-sc-section="skills">
        <h6>Skills</h6>
        <div className={styles.chips}>
          <span>Figma</span>
          <span>Prototyping</span>
          <span>User research</span>
          <span>Design systems</span>
          <span className={styles.missing}>SQL</span>
          <span className={styles.missing}>A/B testing</span>
        </div>
      </section>
      <section data-sc-section="certs">
        <h6>Certifications</h6>
        <p>
          Google UX Design Certificate
          <br />
          <em>2022</em>
        </p>
        <p>
          Accessibility Fundamentals
          <br />
          <em>2023</em>
        </p>
      </section>
      <section data-sc-section="lang">
        <h6>Languages</h6>
        <p>
          Indonesian <em>native</em>
        </p>
        <p>
          English <em>fluent</em>
        </p>
      </section>
    </aside>
  );
}
