"use client";

import { useQuery } from "@tanstack/react-query";
import { listMessages } from "@/lib/app-api/conversations";
import { useConversationSend } from "./use-conversation-send";

export function useConversationThread(id: string) {
  const state = useConversationSend(async () => id);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["app-messages", id],
    queryFn: () => listMessages(id),
  });
  return {
    messages: data ? [...data, ...state.messages] : null,
    busy: state.busy,
    error: state.error,
    isLoading,
    isError,
    refetch,
    send: state.send,
    retry: state.retry,
  };
}
