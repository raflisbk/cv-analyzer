"use client";

import { Check, Copy, RotateCcw } from "lucide-react";
import { useT } from "@/components/i18n/i18n-provider";
import { useChatCopy } from "./use-chat-copy";
import styles from "./message.module.css";

export default function MessageActions({
  text,
  onRegenerate,
}: {
  text: string;
  onRegenerate?: () => void;
}) {
  const { t } = useT();
  const { copied, copy } = useChatCopy(text);
  return (
    <div className={styles.acts}>
      <button type="button" onClick={copy}>
        {copied ? (
          <Check size={14} aria-hidden="true" />
        ) : (
          <Copy size={14} aria-hidden="true" />
        )}
        <span aria-live="polite">
          {copied ? t("app.chat.copied") : t("app.chat.copy")}
        </span>
      </button>
      {onRegenerate && (
        <button type="button" onClick={onRegenerate}>
          <RotateCcw size={14} aria-hidden="true" />
          {t("app.chat.regenerate")}
        </button>
      )}
    </div>
  );
}
