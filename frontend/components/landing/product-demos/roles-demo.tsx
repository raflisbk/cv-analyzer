import styles from "./document-demos.module.css";

export default function RolesDemo() {
  return (
    <div
      className={styles.roles}
      aria-label="Example job matches for Samuel Samdono"
    >
      <div>
        <span>
          <strong>Senior Product Designer</strong>
          <small>Checkout · Payly</small>
        </span>
        <b>78% match</b>
      </div>
      <div>
        <span>
          <strong>UX Designer</strong>
          <small>Commerce products</small>
        </span>
        <b>72% match</b>
      </div>
    </div>
  );
}
