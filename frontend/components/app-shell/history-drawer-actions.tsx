"use client";

import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./app-shell.module.css";
import drawerStyles from "./drawer.module.css";

export default function HistoryDrawerActions({
  close,
  newChat,
}: {
  close: () => void;
  newChat: () => void;
}) {
  const { t } = useT();
  return (
    <>
      <div className={drawerStyles.drawerTop}>
        <strong>{t("app.drawer.title")}</strong>
        <button
          type="button"
          onClick={close}
          aria-label={t("app.drawer.close")}
        >
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
        {t("app.drawer.newChat")}
      </Link>
    </>
  );
}
