"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listMessages, sendMessage } from "@/lib/app-api/conversations";
import type { ChatMessage } from "@/lib/app-api/conversations.types";

export function useConversationThread(id: string) {
  const [newMessages, setNewMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["app-messages", id],
    queryFn: () => listMessages(id),
  });
  const send = async (text: string) => {
    setBusy(true);
    setError("");
    setNewMessages((items) => [
      ...items,
      { id: crypto.randomUUID(), role: "user", text },
    ]);
    try {
      const reply = await sendMessage(id, text);
      setNewMessages((items) => [...items, reply]);
      void queryClient.invalidateQueries({ queryKey: ["app-conversations"] });
    } catch {
      setError("Could not send your message. Try again.");
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
  };
}
