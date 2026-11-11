"use client";

import { useState } from "react";
import styles from "./workspace-styles";

const chips = [
  ["Shorter", "Make this shorter"],
  [
    "Add numbers",
    "Suggest where a user-provided number would clarify this. Use a placeholder, never invent a number.",
  ],
  ["Stronger verb", "Use a stronger action verb without adding facts"],
];
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
      <div className={styles.row}>
        {chips.map(([label, instruction]) => (
          <button
            key={label}
            type="button"
            className={`${styles.pill} ${styles.snow}`}
            onClick={() => request(instruction)}
          >
            {label}
          </button>
        ))}
      </div>
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
