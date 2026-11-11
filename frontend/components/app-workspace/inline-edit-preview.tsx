"use client";

import { useState } from "react";
import { needsNumber } from "@/lib/app-workspace/fixes";
import { InlineEditActions } from "./inline-edit-actions";
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
      <InlineEditActions accept={() => accept(provided)} retry={retry} />
    </>
  );
}
