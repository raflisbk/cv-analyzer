"use client";

import { useT } from "@/components/i18n/i18n-provider";
import { useConversationThread } from "@/hooks/use-conversation-thread";
import ChatComposer from "./chat-composer";
import ChatThread from "./chat-thread";
import LoadingSkeleton from "@/components/app-shell/loading-skeleton";
import shell from "@/components/app-shell/app-shell.module.css";
import styles from "./home-thread.module.css";

export default function SavedConversation({ id }: { id: string }) {
  const { t } = useT();
  const { messages, busy, error, isLoading, isError, refetch, send, retry } =
    useConversationThread(id);
  return (
    <div className={styles.openHome}>
      <section className={`${shell.sheet} ${styles.threadSheet}`}>
        {isLoading && <LoadingSkeleton label={t("app.conversation.loading")} />}
        {isError && (
          <p role="alert">
            {t("app.conversation.loadError")}{" "}
            <button onClick={() => refetch()}>
              {t("app.conversation.retry")}
            </button>
          </p>
        )}
        {messages && <ChatThread messages={messages} typing={busy} />}
        {messages?.length === 0 && <p>{t("app.conversation.empty")}</p>}
        {error && (
          <p className={styles.assistantMessage} role="alert">
            {error}{" "}
            <button type="button" onClick={retry}>
              {t("app.home.retry")}
            </button>
          </p>
        )}
      </section>
      <ChatComposer onSend={send} busy={busy} />
    </div>
  );
}
