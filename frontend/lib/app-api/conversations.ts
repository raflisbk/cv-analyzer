import { apiFetch } from "@/lib/api";
import { USE_APP_MOCKS } from "./mode";
import {
  conversationFixtures,
  messageFixtures,
  mockReply,
} from "./fixtures/conversations";
import type { ChatMessage, ConversationSummary } from "./conversations.types";
import { postConversationMessage } from "./conversations-stream";

export function listConversations(): Promise<ConversationSummary[]> {
  return USE_APP_MOCKS
    ? Promise.resolve(conversationFixtures)
    : apiFetch<ConversationSummary[]>("/conversations");
}

export function createConversation(): Promise<ConversationSummary> {
  if (!USE_APP_MOCKS) {
    return apiFetch<ConversationSummary>("/conversations", {
      method: "POST",
      body: JSON.stringify({ scope: { type: "general" } }),
    });
  }
  const conversation: ConversationSummary = {
    id: crypto.randomUUID(),
    title: "New chat",
    scope: { type: "general" },
    updatedAt: new Date().toISOString(),
  };
  conversationFixtures.unshift(conversation);
  messageFixtures[conversation.id] = [];
  return Promise.resolve(conversation);
}

export function listMessages(id: string): Promise<ChatMessage[]> {
  return USE_APP_MOCKS
    ? Promise.resolve(messageFixtures[id] ?? [])
    : apiFetch<ChatMessage[]>(
        `/conversations/${encodeURIComponent(id)}/messages`,
      );
}

export async function sendMessage(
  id: string,
  text: string,
): Promise<ChatMessage> {
  if (USE_APP_MOCKS) {
    const messages = messageFixtures[id] ?? (messageFixtures[id] = []);
    messages.push({ id: crypto.randomUUID(), role: "user", text });
    const reply = mockReply(text);
    messages.push(reply);
    const summary = conversationFixtures.find((item) => item.id === id);
    if (summary) {
      summary.title = text.slice(0, 60);
      summary.updatedAt = new Date().toISOString();
    }
    return reply;
  }
  return postConversationMessage(id, text);
}
