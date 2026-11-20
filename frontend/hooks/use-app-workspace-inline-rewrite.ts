"use client";

import { useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";
import { requestInlineRewrite } from "@/lib/app-api/workspace";
import { hasUnsupportedNumbers } from "@/lib/app-workspace/factual-rewrite";
import { fillNumber, needsNumber } from "@/lib/app-workspace/fixes";

export function useAppWorkspaceInlineRewrite(
  jobId: string,
  selectedText: string,
  source: string,
  onApply: (text: string) => void,
) {
  const { t } = useT();
  const [rewrite, setRewrite] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function requestRewrite(instruction: string) {
    setBusy(true);
    setError("");
    try {
      setRewrite(await requestInlineRewrite(jobId, selectedText, instruction));
    } catch {
      setError(t("appWorkspace.inline.rewriteFailed"));
    } finally {
      setBusy(false);
    }
  }
  function accept(provided = "") {
    const finalText = needsNumber(rewrite)
      ? fillNumber(rewrite, provided)
      : rewrite;
    if (!finalText) {
      setError(t("appWorkspace.inline.needNumber"));
      return;
    }
    if (hasUnsupportedNumbers(source, finalText, provided)) {
      setError(t("appWorkspace.inline.inventedNumber"));
      return;
    }
    onApply(finalText);
  }
  return { rewrite, error, busy, requestRewrite, accept };
}
