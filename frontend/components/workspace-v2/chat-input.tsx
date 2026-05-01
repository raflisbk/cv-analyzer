"use client";

import { useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  className?: string;
}

export function ChatInput({ onSend, disabled, className }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const resize = () => {
      textarea.style.height = "auto";
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 120);
      textarea.style.height = `${newHeight}px`;
    };

    resize();

    textarea.addEventListener("input", resize);
    return () => textarea.removeEventListener("input", resize);
  }, []);

  const handleSubmit = () => {
    const textarea = textareaRef.current;
    if (!textarea || disabled) {
      return;
    }

    const message = textarea.value.trim();
    if (!message) {
      return;
    }

    onSend(message);
    textarea.value = "";
    textarea.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn("flex items-end gap-2", className)}>
      <textarea
        ref={textareaRef}
        placeholder="Ask AI to refine, explain…"
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className="min-h-[40px] max-h-[120px] w-full resize-none rounded-xl px-3 py-2 text-[11px] leading-relaxed outline-none placeholder:text-[#F5F2D8]/50 disabled:opacity-50"
        style={{
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.12)",
          color: "#F5F2D8",
        }}
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled}
        className="flex h-9 w-9 flex-none items-center justify-center rounded-lg transition-colors hover:bg-[rgba(139,92,246,0.25)] disabled:opacity-50"
        style={{ background: "rgba(139,92,246,0.18)" }}
        aria-label="Send message"
      >
        <Send className="h-3.5 w-3.5 text-[#8B5CF6]/90" />
      </button>
    </div>
  );
}
