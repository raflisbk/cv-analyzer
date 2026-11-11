"use client";

import { useState } from "react";
import { needsNumber } from "@/lib/app-workspace/fixes";
import styles from "./workspace-styles";

export function InlineEditPreview({
  selectedText,
  rewrite,
  accept,
  retry,
}: {
  selectedText: string;
  rewrite: string;
  accept: (provided?: string) => void;
  retry: () => void;
}) {
  const [provided, setProvided] = useState("");
  return (
    <>
      <p>
        <s>{selectedText}</s>
      </p>
      <p>{rewrite}</p>
      {needsNumber(rewrite) && (
        <label>
          Enter your number
          <input
            className={styles.input}
            inputMode="decimal"
            value={provided}
            onChange={(event) => setProvided(event.target.value)}
          />
        </label>
      )}
      <div className={styles.row}>
        <button
          type="button"
          className={`${styles.pill} ${styles.punk}`}
          onClick={() => accept(provided)}
        >
          Accept
        </button>
        <button
          type="button"
          className={`${styles.pill} ${styles.snow}`}
          onClick={retry}
        >
          Try another
        </button>
      </div>
    </>
  );
}
