"use client";

import { useState } from "react";
import type { WorkspaceFix } from "@/lib/app-workspace/fixes";
import { needsNumber } from "@/lib/app-workspace/fixes";
import { USE_APP_MOCKS } from "@/lib/app-api/mode";
import { FixNumberField } from "./fix-number-field";
import { FixCardInputs } from "./fix-card-inputs";
import { FixCardAction } from "./fix-card-action";
import styles from "../workspace-styles";

interface Props {
  fix: WorkspaceFix;
  onApply: (
    text: string,
    anchor: HTMLElement,
    answers: Record<string, string>,
  ) => boolean;
  onShow?: (id: string, section: string) => void;
}

export function FixCard({ fix, onApply, onShow = () => {} }: Props) {
  const [value, setValue] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const inputs = fix.needsInput ?? [];
  const requiresNumber =
    USE_APP_MOCKS && !inputs.length && needsNumber(fix.after);
  return (
    <article className={styles.card} data-fix-card={fix.id}>
      <span className={styles.eyebrow}>{fix.section}</span>
      <strong>{fix.explanation}</strong>
      {fix.before && (
        <span className={styles.muted}>
          <s>{fix.before}</s>
        </span>
      )}
      {fix.after && <span>{fix.after}</span>}
      {requiresNumber && <FixNumberField value={value} setValue={setValue} />}
      <FixCardInputs
        inputs={inputs}
        answers={answers}
        setAnswers={setAnswers}
      />
      {error && <span role="alert">{error}</span>}
      <FixCardAction
        fix={fix}
        inputs={inputs}
        answers={answers}
        value={value}
        requiresNumber={requiresNumber}
        onApply={onApply}
        setError={setError}
        onShow={onShow}
      />
    </article>
  );
}
