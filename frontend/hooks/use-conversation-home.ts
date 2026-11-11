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
  const [jobId, setJobId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const send = async (text: string) => {
    setBusy(true);
    setError("");
    setMessages((items) => [
      ...items,
      { id: crypto.randomUUID(), role: "user", text },
    ]);
    try {
      const id = conversationId ?? (await createConversation()).id;
      setConversationId(id);
      const reply = await sendMessage(id, text);
      setMessages((items) => [...items, reply]);
      void queryClient.invalidateQueries({ queryKey: ["app-conversations"] });
    } catch {
      setError("Could not send your message. Try again.");
    } finally {
      setBusy(false);
    }
  };
  return { messages, busy, error, jobId, setJobId, send };
}
