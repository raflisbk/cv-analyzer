export interface WorkspaceChatAction {
  type: "apply_fix" | "show_in_editor";
  fixId?: string;
  anchorId?: string;
}

export interface WorkspaceChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  actions?: WorkspaceChatAction[];
}
