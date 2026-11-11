export interface ConversationSummary {
  id: string;
  title: string;
  scope: { type: "general" } | { type: "cv"; jobId: string; fileName: string };
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  actions?: (
    | { type: "apply_fix"; fixId: string }
    | { type: "show_in_editor"; anchorId: string }
    | { type: "open_workspace"; jobId: string; view: string }
  )[];
}
