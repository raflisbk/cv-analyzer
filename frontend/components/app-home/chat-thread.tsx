"use client";

import { useT } from "@/components/i18n/i18n-provider";
import type { ChatMessage } from "@/lib/app-api/conversations.types";
import ChatAction from "./chat-action";
import styles from "./home-thread.module.css";

export default function ChatThread({
  messages,
  typing,
}: {
  messages: ChatMessage[];
  typing: boolean;
}) {
  const { t } = useT();
  return (
    <div className={styles.thread} aria-live="polite">
      {messages.map((message) => (
        <div
          className={
            message.role === "user"
              ? styles.userMessage
              : styles.assistantMessage
          }
          key={message.id}
        >
          <p>{message.text}</p>
          {message.actions?.map((action, index) => (
            <ChatAction key={index} action={action} />
          ))}
        </div>
      ))}
      {typing && (
        <div className={styles.typing} aria-label={t("app.home.typing")}>
          <i />
          <i />
          <i />
        </div>
      )}
    </div>
  );
}
