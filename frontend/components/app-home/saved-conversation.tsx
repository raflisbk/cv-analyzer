"use client";

import { useConversationThread } from "@/hooks/use-conversation-thread";
import ChatComposer from "./chat-composer";
import ChatThread from "./chat-thread";
import LoadingSkeleton from "@/components/app-shell/loading-skeleton";
import shell from "@/components/app-shell/app-shell.module.css";
import styles from "./home-thread.module.css";

export default function SavedConversation({ id }: { id: string }) {
  const { messages, busy, error, isLoading, isError, refetch, send, retry } =
    useConversationThread(id);
  return (
    <div className={styles.openHome}>
      <section className={`${shell.sheet} ${styles.threadSheet}`}>
        {isLoading && <LoadingSkeleton label="Loading conversation" />}
        {isError && (
          <p role="alert">
            Could not load this conversation.{" "}
            <button onClick={() => refetch()}>Try again</button>
          </p>
        )}
        {messages && <ChatThread messages={messages} typing={busy} />}
        {messages?.length === 0 && <p>No messages yet. Start the conversation below.</p>}
        {error && (
          <p className={styles.assistantMessage} role="alert">
            {error}{" "}
            <button type="button" onClick={retry}>
              Retry
            </button>
          </p>
        )}
      </section>
      <ChatComposer onSend={send} busy={busy} />
    </div>
  );
}
