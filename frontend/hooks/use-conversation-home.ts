"use client";

import { useState } from "react";
import { createConversation } from "@/lib/app-api/conversations";
import { useConversationSend } from "./use-conversation-send";

export function useConversationHome() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const getId = async () => {
    if (conversationId) {
      return conversationId;
    }
    const conversation = await createConversation(jobId ?? undefined);
    setConversationId(conversation.id);
    return conversation.id;
  };
  return { ...useConversationSend(getId), jobId, setJobId };
}
