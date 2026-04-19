"use client";

import { useEffect, useCallback } from "react";
import { Bot } from "lucide-react";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import { useChatStream } from "@/hooks/use-chat-stream";
import { ChatMessageList } from "./chat-message-list";
import { ChatInput } from "./chat-input";
import { StreamingIndicator } from "./streaming-indicator";
import { cn } from "@/lib/utils";

export function ChatPanel({ className }: { className?: string }) {
  const {
    jobId,
    hydration,
    chatMessages,
    addChatMessage,
    updateLastChatMessage,
    setChatStreaming,
  } = useWorkspaceV2Store();

  // Hydrate chat messages from server on mount
  useEffect(() => {
    if (hydration?.messages && hydration.messages.length > 0) {
      // Only hydrate if store is empty (initial load)
      const storeEmpty = useWorkspaceV2Store.getState().chatMessages.length === 0;
      if (storeEmpty) {
        for (const msg of hydration.messages) {
          addChatMessage(msg);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydration]);

  const { isStreaming, error, send } = useChatStream(jobId, {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
    onToken: (token) => {
      updateLastChatMessage(token);
    },
    onComplete: () => {
      setChatStreaming(false);
      // Mark last message as complete
      const msgs = useWorkspaceV2Store.getState().chatMessages;
      const last = msgs[msgs.length - 1];
      if (last && last.role === "assistant" && last.status === "streaming") {
        const updated = [...msgs];
        updated[updated.length - 1] = {
          ...last,
          status: "complete",
          timestamp: new Date().toISOString(),
        };
        useWorkspaceV2Store.setState({ chatMessages: updated });
      }
    },
    onError: (err) => {
      console.error("Chat error:", err);
      setChatStreaming(false);
      // Update last streaming message to error state
      const msgs = useWorkspaceV2Store.getState().chatMessages;
      const last = msgs[msgs.length - 1];
      if (last && last.role === "assistant" && last.status === "streaming") {
        const updated = [...msgs];
        updated[updated.length - 1] = {
          ...last,
          content: "I couldn't generate a response. Please try again.",
          status: "error",
          timestamp: new Date().toISOString(),
        };
        useWorkspaceV2Store.setState({ chatMessages: updated });
      }
    },
  });

  const handleSend = useCallback(
    async (messageText: string) => {
      if (isStreaming) return;

      addChatMessage({
        timestamp: new Date().toISOString(),
        role: "user",
        content: messageText,
        status: "complete",
      });

      addChatMessage({
        timestamp: new Date().toISOString(),
        role: "assistant",
        content: "",
        status: "streaming",
      });

      setChatStreaming(true);
      await send(messageText);
    },
    [isStreaming, addChatMessage, setChatStreaming, send]
  );

  return (
    <div className={cn("flex h-full flex-col overflow-hidden", className)}>
      {/* Panel header */}
      <div
        className="flex-none rounded-t-2xl border-b px-4 py-3.5"
        style={{
          borderColor: "rgba(255,255,255,0.05)",
          background: "rgba(26,23,15,0.55)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 flex-none items-center justify-center rounded-xl"
            style={{ background: "rgba(139,92,246,0.18)" }}
          >
            <Bot className="h-4 w-4 text-[#8B5CF6]" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-display text-[13px] font-bold leading-tight text-[#F5F2D8]/90">
              AI Copilot
            </h3>
            <p className="text-[10px] leading-tight text-[#F5F2D8]/60">
              Contextual CV assistant
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            {isStreaming ? (
              <>
                <StreamingIndicator active />
                <span className="text-[10px] font-bold text-[#8B5CF6]/60">
                  Streaming
                </span>
              </>
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]/60" />
            )}
          </div>
        </div>
        {error && (
          <div className="mt-2 text-[10px] text-destructive">
            {error.message}. Try again.
          </div>
        )}
      </div>

      {/* Messages list */}
      <div className="min-h-0 flex-1">
        <ChatMessageList messages={chatMessages} isStreaming={isStreaming} />
      </div>

      {/* Input area */}
      <div
        className="flex-none rounded-b-2xl border-t p-3"
        style={{ borderColor: "rgba(139,92,246,0.08)" }}
      >
        <ChatInput onSend={handleSend} disabled={isStreaming} />
      </div>
    </div>
  );
}
