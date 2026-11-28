"use client";

import { useT } from "@/components/i18n/i18n-provider";
import type { ChatMessage } from "@/lib/app-api/conversations.types";
import ChatMessageView from "./chat-message";
import styles from "./chat.module.css";

export interface ThreadArtifact {
  jobId: string;
  cardIds: Set<string>;
  open: boolean;
  show: () => void;
}

export default function ChatThread({
  messages,
  busy,
  artifact,
  onRegenerate,
}: {
  messages: ChatMessage[];
  busy: boolean;
  artifact?: ThreadArtifact;
  onRegenerate?: () => void;
}) {
  const { t } = useT();
  const last = messages[messages.length - 1];
  return (
    <div
      className={styles.thread}
      aria-live="polite"
      aria-label={t("app.chat.thread")}
    >
      {messages.map((message, index) => (
        <ChatMessageView
          key={message.id}
          message={message}
          index={index}
          streaming={busy && message === last}
          artifact={artifact?.cardIds.has(message.id) ? artifact : undefined}
          onRegenerate={message === last && !busy ? onRegenerate : undefined}
        />
      ))}
    </div>
  );
}
