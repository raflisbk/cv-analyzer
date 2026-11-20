import { useT } from "@/components/i18n/i18n-provider";
import type { WorkspaceChatMessage } from "@/lib/app-workspace/chat.types";
import styles from "../workspace-styles";

interface Props {
  messages: WorkspaceChatMessage[];
  onApply: (fixId: string) => void;
  onShow: (anchorId: string) => void;
}

export function ChatMessages({ messages, onApply, onShow }: Props) {
  const { t } = useT();
  if (!messages.length) {
    return <p>{t("appWorkspacePanel.chat.empty")}</p>;
  }
  return (
    <>
      {messages.map((message) => (
        <article
          className={message.role === "assistant" ? styles.card : styles.stat}
          key={message.id}
        >
          <p>{message.text || t("appWorkspacePanel.chat.thinking")}</p>
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
                ? t("appWorkspacePanel.chat.applyDocument")
                : t("appWorkspacePanel.chat.showEditor")}
            </button>
          ))}
        </article>
      ))}
    </>
  );
}
