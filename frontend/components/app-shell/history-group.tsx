import Link from "next/link";
import type { ConversationSummary } from "@/lib/app-api/conversations.types";
import styles from "./drawer.module.css";

export default function HistoryGroup({
  title,
  items,
  close,
}: {
  title: string;
  items: ConversationSummary[];
  close: () => void;
}) {
  return (
    <section>
      <h2>{title}</h2>
      {items.map((item) => (
        <Link
          key={item.id}
          href={
            item.scope.type === "cv"
              ? `/app/cvs/${item.scope.jobId}?view=editor&tab=chat`
              : `/app/chat/${item.id}`
          }
          onClick={close}
        >
          <span>{item.title}</span>
          <small
            className={item.scope.type === "cv" ? styles.cvTag : styles.tag}
          >
            {item.scope.type === "cv" ? item.scope.fileName : "General"}
          </small>
        </Link>
      ))}
    </section>
  );
}
