"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listMessages, sendMessage } from "@/lib/app-api/conversations";
import type { ChatMessage } from "@/lib/app-api/conversations.types";
import ChatComposer from "./chat-composer";
import ChatThread from "./chat-thread";
import shell from "@/components/app-shell/app-shell.module.css";
import styles from "./home-thread.module.css";

export default function SavedConversation({ id }: { id: string }) {
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
  return (
    <div className={styles.openHome}>
      <section className={`${shell.sheet} ${styles.threadSheet}`}>
        {isLoading && <p role="status">Loading conversation…</p>}
        {isError && (
          <p role="alert">
            Could not load this conversation.{" "}
            <button onClick={() => refetch()}>Try again</button>
          </p>
        )}
        {data && (
          <ChatThread messages={[...data, ...newMessages]} typing={busy} />
        )}
        {error && <p role="alert">{error}</p>}
      </section>
      <ChatComposer onSend={send} busy={busy} />
    </div>
  );
}
