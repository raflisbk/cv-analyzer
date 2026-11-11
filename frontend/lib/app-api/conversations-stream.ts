import { ApiError } from "@/lib/api";
import type { ChatMessage } from "./conversations.types";

type Action = NonNullable<ChatMessage["actions"]>[number];
type StreamState = { text: string; actions?: Action[] };

function isAction(value: unknown): value is Action {
  if (!value || typeof value !== "object" || !("type" in value)) {
    return false;
  }
  if (value.type === "apply_fix") {
    return "fixId" in value && typeof value.fixId === "string";
  }
  if (value.type === "show_in_editor") {
    return "anchorId" in value && typeof value.anchorId === "string";
  }
  return (
    value.type === "open_workspace" &&
    "jobId" in value &&
    typeof value.jobId === "string" &&
    "view" in value &&
    typeof value.view === "string"
  );
}

function readEvent(event: string, state: StreamState): void {
  const data = event
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .join("\n");
  if (!data || data === "[DONE]") {
    return;
  }
  const payload: unknown = JSON.parse(data);
  if (!payload || typeof payload !== "object") {
    return;
  }
  if ("error" in payload && typeof payload.error === "string") {
    throw new ApiError("CHAT_FAILED", payload.error);
  }
  if ("token" in payload && typeof payload.token === "string") {
    state.text += payload.token;
  } else if ("text" in payload && typeof payload.text === "string") {
    state.text =
      "type" in payload && payload.type === "complete"
        ? payload.text
        : state.text + payload.text;
  }
  if ("actions" in payload && Array.isArray(payload.actions)) {
    state.actions = payload.actions.filter(isAction);
  }
}

export async function postConversationMessage(
  id: string,
  text: string,
): Promise<ChatMessage> {
  const response = await fetch(
    `/api/v1/conversations/${encodeURIComponent(id)}/messages`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    },
  );
  if (!response.ok || !response.body) {
    throw new ApiError("CHAT_FAILED", "Could not send your message.");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const state: StreamState = { text: "" };
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const event of events) {
      readEvent(event, state);
    }
  }
  readEvent(buffer, state);
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    text: state.text,
    actions: state.actions,
  };
}
