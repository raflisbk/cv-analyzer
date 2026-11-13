import Image from "next/image";
import styles from "./report.module.css";

export function ReportLoadState({
  kind,
  retry,
}: {
  kind: "loading" | "error" | "empty";
  retry?: () => void;
}) {
  if (kind === "loading") {
    return (
      <section className={styles.state} role="status">
        Loading full report…
      </section>
    );
  }
  return (
    <section
      className={styles.state}
      role={kind === "error" ? "alert" : "status"}
    >
      <Image src="/pathy/sad.webp" alt="" width={120} height={130} />
      <h1>
        {kind === "error" ? "Could not load your report" : "No report yet"}
      </h1>
      {kind === "error" ? (
        <button className={`${styles.pill} ${styles.punk}`} onClick={retry}>
          Try again
        </button>
      ) : (
        <p>Analyze this CV to see a detailed report.</p>
      )}
    </section>
  );
}
