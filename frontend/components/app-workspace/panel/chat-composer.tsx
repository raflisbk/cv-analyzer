"use client";

import { useState } from "react";
import styles from "../workspace-styles";

const questions = [
  "What should I fix first?",
  "Rewrite my first bullet",
  "Which keywords am I missing?",
];
export function ChatComposer({
  send,
  busy,
}: {
  send: (value: string) => void;
  busy: boolean;
}) {
  const [input, setInput] = useState("");
  return (
    <>
      <div className={styles.row}>
        {questions.map((question) => (
          <button
            key={question}
            type="button"
            className={`${styles.pill} ${styles.snow}`}
            onClick={() => send(question)}
          >
            {question}
          </button>
        ))}
      </div>
      <form
        className={styles.row}
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
          setInput("");
        }}
      >
        <label htmlFor="cv-chat">Ask about this CV</label>
        <input
          id="cv-chat"
          className={styles.input}
          value={input}
          onChange={(event) => setInput(event.target.value)}
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
