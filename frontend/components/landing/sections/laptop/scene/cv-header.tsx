import styles from "./paper.module.css";

export default function CvHeader() {
  return (
    <header className={styles.header} data-sc-section="contact">
      <i className={styles.avatar}>SS</i>
      <div className={styles.name}>
        <b>Samuel Samdono</b>
        <span>Product Designer</span>
        <div className={styles.tags}>
          <span>✓ Readable text</span>
          <span>✓ Contact found</span>
          <span>✓ Standard headings</span>
        </div>
      </div>
      <small>
        samuel@email.com · +62 812 5550 142
        <br />
        linkedin.com/in/samuelsamdono
        <br />
        Jakarta, Indonesia
      </small>
    </header>
  );
}
