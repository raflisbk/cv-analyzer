"use client";

import { useConversationThread } from "@/hooks/use-conversation-thread";
import ChatComposer from "./chat-composer";
import ChatThread from "./chat-thread";
import shell from "@/components/app-shell/app-shell.module.css";
import styles from "./home-thread.module.css";

export default function SavedConversation({ id }: { id: string }) {
  const { messages, busy, error, isLoading, isError, refetch, send } =
    useConversationThread(id);
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
        {messages && <ChatThread messages={messages} typing={busy} />}
        {error && <p role="alert">{error}</p>}
      </section>
      <ChatComposer onSend={send} busy={busy} />
    </div>
  );
}
