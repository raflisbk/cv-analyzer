"use client";

import { useQuery } from "@tanstack/react-query";
import { useT } from "@/components/i18n/i18n-provider";
import { listConversations } from "@/lib/app-api/conversations";
import { useConversationThread } from "@/hooks/use-conversation-thread";
import { useChatArtifact } from "@/hooks/use-chat-artifact";
import ChatComposer from "@/components/app-chat/chat-composer";
import ChatConversation from "@/components/app-chat/chat-conversation";
import ChatLayout from "@/components/app-chat/chat-layout";
import ChatNote from "@/components/app-chat/chat-note";
import {
  panelProps,
  threadArtifact,
} from "@/components/app-chat/thread-artifact";
import LoadingSkeleton from "@/components/app-shell/loading-skeleton";

export default function SavedConversation({ id }: { id: string }) {
  const { t } = useT();
  const thread = useConversationThread(id);
  const { data: conversations } = useQuery({
    queryKey: ["app-conversations"],
    queryFn: listConversations,
  });
  const scope = conversations?.find((item) => item.id === id)?.scope;
  const jobId = scope?.type === "cv" ? scope.jobId : null;
  const messages = thread.messages ?? [];
  const artifact = useChatArtifact({ jobId, messages, busy: thread.busy });
  const last = messages[messages.length - 1];
  return (
    <ChatLayout
      empty={false}
      scrollSignature={`${messages.length}:${last?.text.length ?? 0}`}
      panel={panelProps(jobId, artifact)}
      bottom={
        <>
          <ChatComposer
            onSend={thread.send}
            busy={thread.busy}
            placeholder={t("app.chat.reply")}
          />
          <ChatNote />
        </>
      }
    >
      {thread.isLoading && (
        <LoadingSkeleton label={t("app.conversation.loading")} />
      )}
      {thread.isError && (
        <p role="alert">
          {t("app.conversation.loadError")}{" "}
          <button onClick={() => thread.refetch()}>
            {t("app.conversation.retry")}
          </button>
        </p>
      )}
      {thread.messages && (
        <ChatConversation
          messages={messages}
          busy={thread.busy}
          error={thread.error}
          onRetry={thread.retry}
          onRegenerate={thread.regenerate}
          artifact={threadArtifact(jobId, artifact)}
        />
      )}
      {thread.messages?.length === 0 && <p>{t("app.conversation.empty")}</p>}
    </ChatLayout>
  );
}
