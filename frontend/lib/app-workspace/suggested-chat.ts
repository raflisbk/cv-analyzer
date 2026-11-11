import type { WorkspaceChatMessage } from "./chat.types";
import type { WorkspaceFix } from "./fixes";

export function suggestedChatMessage(
  fix?: WorkspaceFix,
): WorkspaceChatMessage[] {
  if (!fix) {
    return [];
  }
  return [
    {
      id: `suggested-${fix.id}`,
      role: "assistant",
      text: fix.explanation,
      actions: [
        ...(!fix.after.includes("[")
          ? [{ type: "apply_fix" as const, fixId: fix.id }]
          : []),
        { type: "show_in_editor", anchorId: fix.id },
      ],
    },
  ];
}
