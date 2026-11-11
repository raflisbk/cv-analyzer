"use client";

import { useState } from "react";
import type { WorkspaceFix } from "@/lib/app-workspace/fixes";
import { fillNumber, needsNumber } from "@/lib/app-workspace/fixes";
import { FixNumberField } from "./fix-number-field";
import styles from "../workspace-styles";

interface Props {
  fix: WorkspaceFix;
  onApply: (text: string, anchor: HTMLElement) => boolean;
}

export function FixCard({ fix, onApply }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const requiresNumber = needsNumber(fix.after);
  return (
    <article className={styles.card}>
      <span className={styles.eyebrow}>{fix.section}</span>
      <strong>{fix.explanation}</strong>
      {fix.before && (
        <span className={styles.muted}>
          <s>{fix.before}</s>
        </span>
      )}
      {fix.after && <span>{fix.after}</span>}
      {requiresNumber && <FixNumberField value={value} setValue={setValue} />}
      {error && <span role="alert">{error}</span>}
      <button
        type="button"
        className={`${styles.pill} ${styles.punk}`}
        onClick={(event) => {
          const text = requiresNumber
            ? fillNumber(fix.after, value)
            : fix.after;
          if (!text) {
            setError("Enter a valid number before applying.");
            return;
          }
          if (!onApply(text, event.currentTarget)) {
            setError("The original text is not in this CV.");
          }
        }}
      >
        Apply
      </button>
    </article>
  );
}
