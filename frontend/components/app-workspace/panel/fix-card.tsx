"use client";

import { useState } from "react";
import type { WorkspaceFix } from "@/lib/app-workspace/fixes";
import { fillInputs, fillNumber, needsNumber } from "@/lib/app-workspace/fixes";
import { USE_APP_MOCKS } from "@/lib/app-api/mode";
import { FixNumberField } from "./fix-number-field";
import styles from "../workspace-styles";

interface Props {
  fix: WorkspaceFix;
  onApply: (
    text: string,
    anchor: HTMLElement,
    answers: Record<string, string>,
  ) => boolean;
}

export function FixCard({ fix, onApply }: Props) {
  const [value, setValue] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const inputs = fix.needsInput ?? [];
  const requiresNumber =
    USE_APP_MOCKS && !inputs.length && needsNumber(fix.after);
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
      {inputs.map(({ token, question }) => (
        <label key={token}>
          {question}
          <input
            className={styles.input}
            value={answers[token] ?? ""}
            onChange={(event) =>
              setAnswers((current) => ({
                ...current,
                [token]: event.target.value,
              }))
            }
          />
        </label>
      ))}
      {error && <span role="alert">{error}</span>}
      <button
        type="button"
        className={`${styles.pill} ${styles.punk}`}
        onClick={(event) => {
          const text = inputs.length
            ? fillInputs(fix.after, inputs, answers)
            : requiresNumber
              ? fillNumber(fix.after, value)
              : fix.after;
          if (!text) {
            setError("Enter a valid number before applying.");
            return;
          }
          if (!onApply(text, event.currentTarget, answers)) {
            setError("Could not apply this fix. Check the original text and supplied facts.");
          }
        }}
      >
        Apply
      </button>
    </article>
  );
}
