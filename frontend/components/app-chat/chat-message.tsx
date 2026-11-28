"use client";

import type { CSSProperties } from "react";
import type { ChatMessage } from "@/lib/app-api/conversations.types";
import { renderChatMarkdown } from "@/lib/chat-markdown";
import ChatAction from "@/components/app-home/chat-action";
import ArtifactCard from "./artifact-card";
import AssistantAvatar from "./assistant-avatar";
import MessageActions from "./message-actions";
import TypingDots from "./typing-dots";
import styles from "./message.module.css";

export interface MessageArtifact {
  jobId: string;
  open: boolean;
  show: () => void;
}

interface ChatMessageViewProps {
  message: ChatMessage;
  index: number;
  streaming: boolean;
  artifact?: MessageArtifact;
  onRegenerate?: () => void;
}

export default function ChatMessageView({
  message,
  index,
  streaming,
  artifact,
  onRegenerate,
}: ChatMessageViewProps) {
  const enter = { "--enter": `${Math.min(index, 6) * 40}ms` } as CSSProperties;
  if (message.role === "user") {
    return (
      <div className={styles.user} style={enter}>
        {message.text}
      </div>
    );
  }
  return (
    <div className={styles.assistant} style={enter}>
      <AssistantAvatar />
      <div className={styles.body}>
        {message.text ? (
          <div className={styles.prose}>{renderChatMarkdown(message.text)}</div>
        ) : (
          <TypingDots />
        )}
        {message.actions?.length ? (
          <div className={styles.actionRow}>
            {message.actions.map((action, actionIndex) => (
              <ChatAction key={actionIndex} action={action} />
            ))}
          </div>
        ) : null}
        {artifact && (
          <ArtifactCard
            jobId={artifact.jobId}
            open={artifact.open}
            onOpen={artifact.show}
          />
        )}
        {message.text && !streaming && (
          <MessageActions text={message.text} onRegenerate={onRegenerate} />
        )}
      </div>
    </div>
  );
}
