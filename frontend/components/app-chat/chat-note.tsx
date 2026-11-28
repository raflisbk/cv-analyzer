"use client";

import { useT } from "@/components/i18n/i18n-provider";
import styles from "./chat.module.css";

export default function ChatNote() {
  const { t } = useT();
  return <p className={styles.note}>{t("app.chat.footer")}</p>;
}
