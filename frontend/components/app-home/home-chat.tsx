"use client";

import { useQuery } from "@tanstack/react-query";
import { listCvs } from "@/lib/app-api/cvs";
import { useConversationHome } from "@/hooks/use-conversation-home";
import ChatComposer from "./chat-composer";
import ChatThread from "./chat-thread";
import AnalysisProgress from "./analysis-progress";
import HomeHero from "./home-hero";
import HomeQuickLinks from "./home-quick-links";
import shell from "@/components/app-shell/app-shell.module.css";
import styles from "./home.module.css";
import threadStyles from "./home-thread.module.css";

export default function HomeChat() {
  const { messages, busy, error, jobId, setJobId, send } =
    useConversationHome();
  const { data: cvs } = useQuery({ queryKey: ["app-cvs"], queryFn: listCvs });
  const latest = cvs?.[0];
  return (
    <div
      className={messages.length || jobId ? threadStyles.openHome : styles.home}
    >
      {!messages.length && !jobId && <HomeHero />}
      {(messages.length > 0 || jobId) && (
        <section className={`${shell.sheet} ${threadStyles.threadSheet}`}>
          <ChatThread messages={messages} typing={busy} />
          {jobId && <AnalysisProgress jobId={jobId} />}
          {error && <p role="alert">{error}</p>}
        </section>
      )}
      <ChatComposer onSend={send} busy={busy} onUploaded={setJobId} />
      {!messages.length && !jobId && (
        <HomeQuickLinks latest={latest} send={send} />
      )}
    </div>
  );
}
