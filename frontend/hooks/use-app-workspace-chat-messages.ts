"use client";

import { useState } from "react";
import { useChatStream } from "@/hooks/use-chat-stream";
import type { WorkspaceChatMessage } from "@/lib/app-workspace/chat.types";

export function useAppWorkspaceChatMessages(jobId: string) {
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
  return { messages, stream, send };
}
