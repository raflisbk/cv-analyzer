import styles from "../workspace-styles";

const questions = [
  "What should I fix first?",
  "Rewrite my first bullet",
  "Which keywords am I missing?",
];
export function ChatQuickQuestions({
  send,
}: {
  send: (value: string) => void;
}) {
  return (
    <div className={styles.row}>
      {questions.map((question) => (
        <button
          key={question}
          type="button"
          className={`${styles.pill} ${styles.snow}`}
          onClick={() => send(question)}
        >
          {question}
        </button>
      ))}
    </div>
  );
}
