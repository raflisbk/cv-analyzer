"use client";

import { useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";
import { InlineEditChips } from "./inline-edit-chips";
import styles from "./workspace-styles";

export function InlineEditPrompt({
  request,
  busy,
}: {
  request: (instruction: string) => void;
  busy: boolean;
}) {
  const [prompt, setPrompt] = useState("");
  const { t } = useT();
  return (
    <>
      <InlineEditChips request={request} />
      <form
        className={styles.row}
        onSubmit={(event) => {
          event.preventDefault();
          request(prompt);
        }}
      >
        <label htmlFor="inline-instruction">
          {t("appWorkspace.inline.prompt")}
        </label>
        <input
          id="inline-instruction"
          className={styles.input}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
        />
        <button
          type="submit"
          className={`${styles.pill} ${styles.punk}`}
          disabled={busy}
        >
          {t("appWorkspace.inline.send")}
        </button>
      </form>
    </>
  );
}
