"use client";

import { useState } from "react";
import { InlineEditChips } from "./inline-edit-chips";
import styles from "./workspace-styles";

export function InlineEditPrompt({
  request,
  busy,
}: {
  request: (instruction: string) => void;
  busy: boolean;
}) {
  const [prompt, setPrompt] = useState("");
  return (
    <>
      <InlineEditChips request={request} />
      <form
        className={styles.row}
        onSubmit={(event) => {
          event.preventDefault();
          request(prompt);
        }}
      >
        <label htmlFor="inline-instruction">What should change?</label>
        <input
          id="inline-instruction"
          className={styles.input}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
        />
        <button
          type="submit"
          className={`${styles.pill} ${styles.punk}`}
          disabled={busy}
        >
          Send
        </button>
      </form>
    </>
  );
}
