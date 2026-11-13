import Link from "next/link";
import styles from "./app-shell.module.css";
import drawerStyles from "./drawer.module.css";

export default function HistoryDrawerActions({
  close,
  newChat,
}: {
  close: () => void;
  newChat: () => void;
}) {
  return (
    <>
      <div className={drawerStyles.drawerTop}>
        <strong>Chat history</strong>
        <button type="button" onClick={close} aria-label="Close chat history">
          ×
        </button>
      </div>
      <Link
        className={`${styles.pill} ${styles.punk}`}
        href="/app"
        onClick={() => {
          newChat();
          close();
        }}
      >
        + New chat
      </Link>
    </>
  );
}
