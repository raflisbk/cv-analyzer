"use client";

import { useQuery } from "@tanstack/react-query";
import { useT } from "@/components/i18n/i18n-provider";
import { listCvs } from "@/lib/app-api/cvs";
import { useConversationHome } from "@/hooks/use-conversation-home";
import { useChatArtifact } from "@/hooks/use-chat-artifact";
import ChatComposer from "@/components/app-chat/chat-composer";
import ChatConversation from "@/components/app-chat/chat-conversation";
import ChatLayout from "@/components/app-chat/chat-layout";
import ChatNote from "@/components/app-chat/chat-note";
import {
  panelProps,
  threadArtifact,
} from "@/components/app-chat/thread-artifact";
import AnalysisProgress from "./analysis-progress";
import HomeHero from "./home-hero";
import HomeQuickLinks from "./home-quick-links";

export default function HomeChat() {
  const { t } = useT();
  const chat = useConversationHome();
  const { messages, busy, jobId } = chat;
  const { data: cvs } = useQuery({ queryKey: ["app-cvs"], queryFn: listCvs });
  const artifact = useChatArtifact({ jobId, messages, busy });
  const started = messages.length > 0 || Boolean(jobId);
  const last = messages[messages.length - 1];
  return (
    <ChatLayout
      empty={!started}
      scrollSignature={`${messages.length}:${last?.text.length ?? 0}:${jobId}`}
      panel={panelProps(jobId, artifact)}
      bottom={
        <>
          <ChatComposer
            onSend={chat.send}
            busy={busy}
            onUploaded={chat.setJobId}
            placeholder={t(started ? "app.chat.reply" : "app.home.composer")}
          />
          {started ? (
            <ChatNote />
          ) : (
            <HomeQuickLinks latest={cvs?.[0]} send={chat.send} />
          )}
        </>
      }
    >
      {started ? (
        <ChatConversation
          messages={messages}
          busy={busy}
          error={chat.error}
          onRetry={chat.retry}
          onRegenerate={() => chat.regenerate()}
          artifact={threadArtifact(jobId, artifact)}
        >
          {jobId && <AnalysisProgress jobId={jobId} />}
        </ChatConversation>
      ) : (
        <HomeHero />
      )}
    </ChatLayout>
  );
}
