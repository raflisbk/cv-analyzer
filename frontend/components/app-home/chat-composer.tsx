"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import HelpButton from "@/components/pathy/help-button";
import UploadCvButton from "@/components/app-shell/upload-cv-button";
import styles from "./home.module.css";
import arrow from "./arrow.webp";

interface ChatComposerProps {
  onSend: (text: string) => void;
  busy: boolean;
  onUploaded?: (jobId: string) => void;
}

export default function ChatComposer({
  onSend,
  busy,
  onUploaded,
}: ChatComposerProps) {
  const [text, setText] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const value = text.trim();
    if (value && !busy) {
      onSend(value);
      setText("");
    }
  };
  return (
    <form
      className={styles.composer}
      data-tour="home-composer"
      onSubmit={submit}
    >
      <HelpButton helpKey="home" />
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        aria-label="Ask about your CV or career"
        placeholder="Ask about your CV or career"
      />
      {onUploaded && (
        <UploadCvButton label="Upload CV" onUploaded={onUploaded} />
      )}
      <button
        className={styles.ask}
        type="submit"
        disabled={!text.trim() || busy}
      >
        Ask <Image src={arrow} alt="" width={40} height={40} />
      </button>
    </form>
  );
}
