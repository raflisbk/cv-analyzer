"use client";

import { useState } from "react";
import HelpButton from "@/components/pathy/help-button";
import { useChatStream } from "@/hooks/use-chat-stream";
import type { WorkspaceChatMessage } from "@/lib/app-workspace/chat.types";
import type { WorkspaceFix } from "@/lib/app-workspace/fixes";
import { ChatMessages } from "./chat-messages";
import { ChatComposer } from "./chat-composer";
import styles from "../workspace-styles";

export function ChatPane({
  jobId,
  fileName,
  onApply,
  onShow,
  suggestedFix,
}: {
  jobId: string;
  fileName: string;
  onApply: (fixId: string) => void;
  onShow: (anchorId: string) => void;
  suggestedFix?: WorkspaceFix;
}) {
  const [messages, setMessages] = useState<WorkspaceChatMessage[]>([]);
  const stream = useChatStream(jobId, {
    apiUrl: "/api/v1",
    onToken: (token) =>
      setMessages((current) =>
        current.map((message, index) =>
          index === current.length - 1
            ? { ...message, text: message.text + token }
            : message,
        ),
      ),
  });
  function send(value: string) {
    if (!value.trim()) {
      return;
    }
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", text: value },
      { id: crypto.randomUUID(), role: "assistant", text: "" },
    ]);
    void stream.send(value);
  }
  const displayedMessages: WorkspaceChatMessage[] = messages.length ? messages : suggestedFix ? [{
    id: `suggested-${suggestedFix.id}`,
    role: "assistant",
    text: suggestedFix.explanation,
    actions: [
      ...(!suggestedFix.after.includes("[") ? [{ type: "apply_fix" as const, fixId: suggestedFix.id }] : []),
      { type: "show_in_editor", anchorId: suggestedFix.id },
    ],
  }] : [];
  return (
    <div className={styles.pane}>
      <div className={styles.row}>
        <span className={styles.eyebrow}>
          Chat about {fileName} · saved in history
        </span>
        <HelpButton helpKey="chat" />
      </div>
      <ChatMessages messages={displayedMessages} onApply={onApply} onShow={onShow} />
      <ChatComposer send={send} busy={stream.isStreaming} />
      {stream.error && <p role="alert">Chat could not respond. Try again.</p>}
    </div>
  );
}
