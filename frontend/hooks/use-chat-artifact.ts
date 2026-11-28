"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/app-api/conversations.types";
import { artifactMessageIds } from "@/lib/chat-artifact-intent";

const WIDE_QUERY = "(min-width: 900px)";

interface ChatArtifactInput {
  jobId: string | null;
  messages: ChatMessage[];
  busy: boolean;
}

function focusLastTrigger() {
  const triggers = document.querySelectorAll<HTMLElement>(
    "[data-artifact-trigger]",
  );
  triggers[triggers.length - 1]?.focus();
}

export function useChatArtifact({ jobId, messages, busy }: ChatArtifactInput) {
  const [open, setOpen] = useState(false);
  const enabled = Boolean(jobId);
  const cardIds = useMemo(
    () => (enabled ? artifactMessageIds(messages) : new Set<string>()),
    [enabled, messages],
  );
  const wasBusy = useRef(false);
  const lastMessage = messages[messages.length - 1];
  useEffect(() => {
    const finished = wasBusy.current && !busy;
    wasBusy.current = busy;
    if (
      finished &&
      lastMessage &&
      cardIds.has(lastMessage.id) &&
      window.matchMedia(WIDE_QUERY).matches
    ) {
      setOpen(true);
    }
  }, [busy, cardIds, lastMessage]);
  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(focusLastTrigger);
  }, []);
  return { enabled, open: enabled && open, cardIds, show, hide };
}
