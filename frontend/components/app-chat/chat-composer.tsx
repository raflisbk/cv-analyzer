"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";
import { useT } from "@/components/i18n/i18n-provider";
import HelpButton from "@/components/pathy/help-button";
import UploadPill from "./upload-pill";
import { useComposerGrow } from "./use-composer-grow";
import styles from "./composer.module.css";

interface ChatComposerProps {
  onSend: (text: string) => void;
  busy: boolean;
  placeholder: string;
  onUploaded?: (jobId: string) => void;
}

export default function ChatComposer({
  onSend,
  busy,
  placeholder,
  onUploaded,
}: ChatComposerProps) {
  const { t } = useT();
  const [text, setText] = useState("");
  const field = useRef<HTMLTextAreaElement>(null);
  useComposerGrow(field, text);
  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const value = text.trim();
    if (value && !busy) {
      onSend(value);
      setText("");
    }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      submit();
    }
  };
  return (
    <form
      className={styles.composer}
      data-tour="home-composer"
      onSubmit={submit}
    >
      <textarea
        ref={field}
        rows={1}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={onKeyDown}
        aria-label={placeholder}
        placeholder={placeholder}
      />
      <div className={styles.row}>
        <div className={styles.tools}>
          <UploadPill onUploaded={onUploaded} />
          <HelpButton helpKey="home" />
        </div>
        <button
          className={styles.send}
          type="submit"
          aria-label={t("app.chat.send")}
          disabled={!text.trim() || busy}
        >
          <ArrowUp size={19} strokeWidth={2.8} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
