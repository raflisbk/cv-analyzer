"use client";

import { useAppWorkspaceChatMessages } from "@/hooks/use-app-workspace-chat-messages";
import type { WorkspaceFix } from "@/lib/app-workspace/fixes";
import { suggestedChatMessage } from "@/lib/app-workspace/suggested-chat";
import { ChatMessages } from "./chat-messages";
import { ChatComposer } from "./chat-composer";
import { ChatHeading } from "./chat-heading";
import styles from "../workspace-styles";

export function ChatPane({
  jobId,
  fileName,
  onApply,
  onShow,
  suggestedFix,
}: {
  jobId: string;
  fileName: string;
  onApply: (fixId: string) => void;
  onShow: (anchorId: string) => void;
  suggestedFix?: WorkspaceFix;
}) {
  const { messages, stream, send } = useAppWorkspaceChatMessages(jobId);
  const displayedMessages = messages.length
    ? messages
    : suggestedChatMessage(suggestedFix);
  return (
    <div className={styles.pane}>
      <ChatHeading fileName={fileName} />
      <ChatMessages
        messages={displayedMessages}
        onApply={onApply}
        onShow={onShow}
      />
      <ChatComposer send={send} busy={stream.isStreaming} />
      {stream.error && <p role="alert">Chat could not respond. Try again.</p>}
    </div>
  );
}
