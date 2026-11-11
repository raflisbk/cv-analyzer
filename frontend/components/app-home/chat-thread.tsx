import type { ChatMessage } from "@/lib/app-api/conversations.types";
import ChatAction from "./chat-action";
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
          {message.actions?.map((action, index) => (
            <ChatAction key={index} action={action} />
          ))}
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
