"use client";

import type { ReactNode } from "react";
import { useT } from "@/components/i18n/i18n-provider";
import type { ChatMessage } from "@/lib/app-api/conversations.types";
import ChatThread, { type ThreadArtifact } from "./chat-thread";
import styles from "./chat.module.css";

interface ChatConversationProps {
  messages: ChatMessage[];
  busy: boolean;
  error: string;
  onRetry: () => void;
  onRegenerate: () => void;
  artifact?: ThreadArtifact;
  children?: ReactNode;
}

export default function ChatConversation({
  messages,
  busy,
  error,
  onRetry,
  onRegenerate,
  artifact,
  children,
}: ChatConversationProps) {
  const { t } = useT();
  return (
    <>
      <ChatThread
        messages={messages}
        busy={busy}
        artifact={artifact}
        onRegenerate={onRegenerate}
      />
      {children}
      {error && (
        <p className={styles.error} role="alert">
          {error}{" "}
          <button type="button" onClick={onRetry}>
            {t("app.home.retry")}
          </button>
        </p>
      )}
    </>
  );
}
