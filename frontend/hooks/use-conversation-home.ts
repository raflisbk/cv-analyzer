"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createConversation, sendMessage } from "@/lib/app-api/conversations";
import type { ChatMessage } from "@/lib/app-api/conversations.types";

export function useConversationHome() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [failedText, setFailedText] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const send = async (text: string, retry = false) => {
    if (busy) return;
    setBusy(true);
    setError("");
    setFailedText("");
    if (retry) setMessages((items) => items.slice(0, -2));
    const pendingId = crypto.randomUUID();
    setMessages((items) => [
      ...items,
      { id: crypto.randomUUID(), role: "user", text },
      { id: pendingId, role: "assistant", text: "" },
    ]);
    try {
      const id =
        conversationId ?? (await createConversation(jobId ?? undefined)).id;
      setConversationId(id);
      const reply = await sendMessage(id, text, (chunk) => {
        setMessages((items) =>
          items.map((item) =>
            item.id === pendingId ? { ...item, text: chunk } : item,
          ),
        );
      });
      setMessages((items) =>
        items.map((item) =>
          item.id === pendingId ? { ...reply, id: pendingId } : item,
        ),
      );
      void queryClient.invalidateQueries({ queryKey: ["app-conversations"] });
    } catch {
      setError("Could not send your message. Try again.");
      setFailedText(text);
    } finally {
      setBusy(false);
    }
  };
  return {
    messages,
    busy,
    error,
    jobId,
    setJobId,
    send,
    retry: () => send(failedText, true),
  };
}
