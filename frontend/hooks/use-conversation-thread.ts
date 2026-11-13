"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listMessages, sendMessage } from "@/lib/app-api/conversations";
import type { ChatMessage } from "@/lib/app-api/conversations.types";

export function useConversationThread(id: string) {
  const [newMessages, setNewMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [failedText, setFailedText] = useState("");
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["app-messages", id],
    queryFn: () => listMessages(id),
  });
  const send = async (text: string, retry = false) => {
    if (busy) return;
    setBusy(true);
    setError("");
    setFailedText("");
    if (retry) setNewMessages((items) => items.slice(0, -2));
    const pendingId = crypto.randomUUID();
    setNewMessages((items) => [
      ...items,
      { id: crypto.randomUUID(), role: "user", text },
      { id: pendingId, role: "assistant", text: "" },
    ]);
    try {
      const reply = await sendMessage(id, text, (chunk) => {
        setNewMessages((items) =>
          items.map((item) =>
            item.id === pendingId ? { ...item, text: chunk } : item,
          ),
        );
      });
      setNewMessages((items) =>
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
    messages: data ? [...data, ...newMessages] : null,
    busy,
    error,
    isLoading,
    isError,
    refetch,
    send,
    retry: () => send(failedText, true),
  };
}
