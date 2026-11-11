"use client";

import { useState } from "react";
import { ChatQuickQuestions } from "./chat-quick-questions";
import styles from "../workspace-styles";

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
      <ChatQuickQuestions send={send} />
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
