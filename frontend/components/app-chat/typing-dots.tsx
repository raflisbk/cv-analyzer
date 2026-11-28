"use client";

import { useT } from "@/components/i18n/i18n-provider";
import styles from "./message.module.css";

export default function TypingDots() {
  const { t } = useT();
  return (
    <span
      className={styles.typing}
      role="status"
      aria-label={t("app.home.typing")}
    >
      <i />
      <i />
      <i />
    </span>
  );
}
