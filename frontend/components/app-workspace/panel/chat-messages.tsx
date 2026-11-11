import type { WorkspaceChatMessage } from "@/lib/app-workspace/chat.types";
import styles from "../workspace-styles";

export function ChatMessages({
  messages,
  onApply,
  onShow,
}: {
  messages: WorkspaceChatMessage[];
  onApply: (fixId: string) => void;
  onShow: (anchorId: string) => void;
}) {
  if (!messages.length) {
    return <p>Ask a question about this CV. Your chat stays with this file.</p>;
  }
  return (
    <>
      {messages.map((message) => (
        <article
          className={message.role === "assistant" ? styles.card : styles.stat}
          key={message.id}
        >
          <p>{message.text || "Thinking…"}</p>
          {message.actions?.map((action, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.pill} ${styles.punk}`}
              onClick={() =>
                action.type === "apply_fix" && action.fixId
                  ? onApply(action.fixId)
                  : action.anchorId
                    ? onShow(action.anchorId)
                    : undefined
              }
            >
              {action.type === "apply_fix"
                ? "Apply to document"
                : "Show in editor"}
            </button>
          ))}
        </article>
      ))}
    </>
  );
}
