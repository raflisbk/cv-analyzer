"use client";

import { useState } from "react";
import styles from "../workspace-styles";

export function JobMatchActions({ openFixes }: { openFixes: () => void }) {
  const [saved, setSaved] = useState(false);
  return (
    <div className={styles.row}>
      <button
        type="button"
        className={`${styles.pill} ${styles.punk}`}
        onClick={openFixes}
      >
        Tailor my CV to this job
      </button>
      <button
        type="button"
        className={`${styles.pill} ${styles.snow}`}
        onClick={() => setSaved(true)}
      >
        {saved ? "Job saved" : "Save this job"}
      </button>
    </div>
  );
}
