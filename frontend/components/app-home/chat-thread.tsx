import Link from "next/link";
import type { ChatMessage } from "@/lib/app-api/conversations.types";
import styles from "./home-thread.module.css";

export default function ChatThread({
  messages,
  typing,
}: {
  messages: ChatMessage[];
  typing: boolean;
}) {
  return (
    <div className={styles.thread} aria-live="polite">
      {messages.map((message) => (
        <div
          className={
            message.role === "user"
              ? styles.userMessage
              : styles.assistantMessage
          }
          key={message.id}
        >
          <p>{message.text}</p>
          {message.actions?.map((action, index) => {
            if (action.type === "open_workspace") {
              return (
                <Link
                  key={index}
                  href={`/app/cvs/${action.jobId}?view=${action.view}`}
                >
                  Open workspace
                </Link>
              );
            }
            if (action.type === "show_in_editor") {
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    document
                      .querySelector(
                        `[data-anchor-id='${CSS.escape(action.anchorId)}']`,
                      )
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Show in editor
                </button>
              );
            }
            return (
              <button key={index} type="button" data-fix-id={action.fixId}>
                Apply fix
              </button>
            );
          })}
        </div>
      ))}
      {typing && (
        <div className={styles.typing} aria-label="Pathy is typing">
          <i />
          <i />
          <i />
        </div>
      )}
    </div>
  );
}
