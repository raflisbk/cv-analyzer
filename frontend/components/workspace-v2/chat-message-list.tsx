"use client";

import { useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/stores/workspace-v2-store";
import { StreamingIndicator } from "./streaming-indicator";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  className?: string;
}

export function ChatMessageList({ messages, isStreaming, className }: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className={cn("flex h-full flex-col items-center justify-center px-6 text-center", className)}>
        <Bot className="mb-3 h-8 w-8 text-[#8B5CF6]/50" />
        <p className="mb-1 text-[13px] font-semibold text-[#F5F2D8]/90">
          Ask your CV assistant
        </p>
        <p className="text-[11px] leading-relaxed text-[#F5F2D8]/60">
          Get contextual suggestions, grammar fixes, or rewrite advice based on
          your analysis.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className={cn("flex flex-col gap-3 overflow-y-auto px-3.5 py-3", className)}
    >
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={cn(
            "flex gap-2",
            msg.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          {msg.role === "assistant" && (
            <div className="mt-auto flex h-6 w-6 flex-none items-center justify-center rounded-lg">
              <Bot className="h-3.5 w-3.5 text-[#8B5CF6]" />
            </div>
          )}
          <div
            className={cn(
              "max-w-[85%] rounded-xl px-3 py-2",
              msg.role === "user"
                ? "bg-[rgba(255,255,255,0.82)] text-gray-900"
                : msg.status === "error"
                  ? "bg-destructive/15 text-destructive"
                  : "bg-[rgba(245,242,216,0.06)] text-[#F5F2D8]"
            )}
          >
            <p className="whitespace-pre-wrap break-words text-[11px] leading-relaxed">
              {msg.content}
              {msg.status === "streaming" && <StreamingIndicator active />}
            </p>
            {msg.status === "complete" && (
              <p className="mt-1 text-[9px] text-[#F5F2D8]/40">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      ))}
      {isStreaming &&
        messages[messages.length - 1]?.status !== "streaming" && (
          <div className="flex justify-start gap-2">
            <div className="flex h-6 w-6 flex-none items-center justify-center rounded-lg">
              <Bot className="h-3.5 w-3.5 text-[#8B5CF6]" />
            </div>
            <div className="rounded-xl bg-[rgba(245,242,216,0.06)] px-3 py-2">
              <div className="flex gap-1">
                <StreamingIndicator active />
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
