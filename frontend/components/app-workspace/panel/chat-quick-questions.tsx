import { useT } from "@/components/i18n/i18n-provider";
import styles from "../workspace-styles";

const questions = ["quickFirst", "quickRewrite", "quickKeywords"];
export function ChatQuickQuestions({
  send,
}: {
  send: (value: string) => void;
}) {
  const { t } = useT();
  return (
    <div className={styles.row}>
      {questions.map((key) => {
        const question = t(`appWorkspacePanel.chat.${key}`);
        return (
          <button
            key={key}
            type="button"
            className={`${styles.pill} ${styles.snow}`}
            onClick={() => send(question)}
          >
            {question}
          </button>
        );
      })}
    </div>
  );
}
