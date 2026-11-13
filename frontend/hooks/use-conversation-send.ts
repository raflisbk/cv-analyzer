"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "@/lib/app-api/conversations";
import type { ChatMessage } from "@/lib/app-api/conversations.types";

type SetMessages = Dispatch<SetStateAction<ChatMessage[]>>;

async function streamReply(
  getId: () => Promise<string>,
  text: string,
  pendingId: string,
  setMessages: SetMessages,
) {
  const id = await getId();
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
}

export function useConversationSend(getId: () => Promise<string>) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [failedText, setFailedText] = useState("");
  const queryClient = useQueryClient();
  const send = async (text: string, retry = false) => {
    if (busy) {
      return;
    }
    setBusy(true);
    setError("");
    setFailedText("");
    if (retry) {
      setMessages((items) => items.slice(0, -2));
    }
    const pendingId = crypto.randomUUID();
    setMessages((items) => [
      ...items,
      { id: crypto.randomUUID(), role: "user", text },
      { id: pendingId, role: "assistant", text: "" },
    ]);
    try {
      await streamReply(getId, text, pendingId, setMessages);
      void queryClient.invalidateQueries({ queryKey: ["app-conversations"] });
    } catch {
      setError("Could not send your message. Try again.");
      setFailedText(text);
    } finally {
      setBusy(false);
    }
  };
  return { messages, busy, error, send, retry: () => send(failedText, true) };
}
