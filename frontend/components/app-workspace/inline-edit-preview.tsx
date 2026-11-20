"use client";

import { useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";
import { needsNumber } from "@/lib/app-workspace/fixes";
import { InlineEditActions } from "./inline-edit-actions";
import styles from "./workspace-styles";

export function InlineEditPreview({
  selectedText,
  rewrite,
  accept,
  retry,
}: {
  selectedText: string;
  rewrite: string;
  accept: (provided?: string) => void;
  retry: () => void;
}) {
  const [provided, setProvided] = useState("");
  const { t } = useT();
  return (
    <>
      <p>
        <s>{selectedText}</s>
      </p>
      <p>{rewrite}</p>
      {needsNumber(rewrite) && (
        <label>
          {t("appWorkspace.inline.enterNumber")}
          <input
            className={styles.input}
            inputMode="decimal"
            value={provided}
            onChange={(event) => setProvided(event.target.value)}
          />
        </label>
      )}
      <InlineEditActions accept={() => accept(provided)} retry={retry} />
    </>
  );
}
