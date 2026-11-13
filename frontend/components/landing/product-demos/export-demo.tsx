import { demoTemplates } from "@/lib/landing-stickers";
import styles from "./document-demos.module.css";

export default function ExportDemo() {
  return (
    <div className={styles.export}>
      <div
        className={styles.page}
        role="img"
        aria-label="ATS-ready PDF preview for Samuel Samdono, Product Designer"
      >
        <strong>Samuel Samdono</strong>
        <span>Product Designer · Payly</span>
        <i />
        <i />
        <i className={styles.short} />
        <b>Experience</b>
        <i />
        <i className={styles.short} />
        <span className={styles.ready}>✓ ATS ready</span>
      </div>
      <div className={styles.templates} aria-label="PDF templates">
        {demoTemplates.map((name) => (
          <span key={name}>{name}</span>
        ))}
      </div>
    </div>
  );
}
