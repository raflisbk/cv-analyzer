import { apiFetch, ApiError } from "@/lib/api";
import { USE_APP_MOCKS } from "./mode";
import {
  conversationFixtures,
  messageFixtures,
  mockReply,
} from "./fixtures/conversations";
import type { ChatMessage, ConversationSummary } from "./conversations.types";
import { postConversationMessage } from "./conversations-stream";
import { rawRequest } from "./raw-request";
import { responseError } from "./response-error";

export function listConversations(): Promise<ConversationSummary[]> {
  return USE_APP_MOCKS
    ? Promise.resolve(conversationFixtures)
    : apiFetch<ConversationSummary[]>("/conversations");
}

export function createConversation(
  jobId?: string,
): Promise<ConversationSummary> {
  if (!USE_APP_MOCKS) {
    return apiFetch<ConversationSummary>("/conversations", {
      method: "POST",
      body: JSON.stringify(jobId ? { jobId } : {}),
    });
  }
  const conversation: ConversationSummary = {
    id: crypto.randomUUID(),
    title: "New chat",
    scope: jobId
      ? { type: "cv", jobId, fileName: "Your CV" }
      : { type: "general" },
    updatedAt: new Date().toISOString(),
  };
  conversationFixtures.unshift(conversation);
  messageFixtures[conversation.id] = [];
  return Promise.resolve(conversation);
}

export async function listMessages(id: string): Promise<ChatMessage[]> {
  if (USE_APP_MOCKS) {
    return messageFixtures[id] ?? [];
  }
  const response = await rawRequest(
    `/api/v1/conversations/${encodeURIComponent(id)}/messages`,
  );
  if (!response.ok) {
    throw await responseError(response, "Could not load messages.");
  }
  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) {
    throw new ApiError("PARSE_ERROR", "Unexpected messages response.");
  }
  return payload as ChatMessage[];
}

export async function sendMessage(
  id: string,
  text: string,
  onUpdate?: (text: string) => void,
): Promise<ChatMessage> {
  if (USE_APP_MOCKS) {
    const messages = messageFixtures[id] ?? (messageFixtures[id] = []);
    messages.push({ id: crypto.randomUUID(), role: "user", text });
    const reply = mockReply(text);
    onUpdate?.(reply.text);
    messages.push(reply);
    const summary = conversationFixtures.find((item) => item.id === id);
    if (summary) {
      summary.title = text.slice(0, 60);
      summary.updatedAt = new Date().toISOString();
    }
    return reply;
  }
  return postConversationMessage(id, text, onUpdate);
}
