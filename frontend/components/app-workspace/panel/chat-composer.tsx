"use client";

import { useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";
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
  const { t } = useT();
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
        <label htmlFor="cv-chat">{t("appWorkspacePanel.chat.ask")}</label>
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
          {t("appWorkspacePanel.chat.send")}
        </button>
      </form>
    </>
  );
}
