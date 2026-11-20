"use client";

import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";
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
  const { t } = useT();
  return (
    <section>
      <h2>{title}</h2>
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/app/chat/${encodeURIComponent(item.id)}`}
          onClick={close}
        >
          <span>{item.title}</span>
          <small
            className={item.scope.type === "cv" ? styles.cvTag : styles.tag}
          >
            {item.scope.type === "cv"
              ? item.scope.fileName
              : t("app.drawer.general")}
          </small>
        </Link>
      ))}
    </section>
  );
}
