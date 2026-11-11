"use client";

import { useState } from "react";
import { requestInlineRewrite } from "@/lib/app-api/workspace";
import { hasUnsupportedNumbers } from "@/lib/app-workspace/factual-rewrite";
import { fillNumber, needsNumber } from "@/lib/app-workspace/fixes";

export function useAppWorkspaceInlineRewrite(
  jobId: string,
  selectedText: string,
  source: string,
  onApply: (text: string) => void,
) {
  const [rewrite, setRewrite] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function requestRewrite(instruction: string) {
    setBusy(true);
    setError("");
    try {
      setRewrite(await requestInlineRewrite(jobId, selectedText, instruction));
    } catch {
      setError("Rewrite failed. Try again.");
    } finally {
      setBusy(false);
    }
  }
  function accept(provided = "") {
    const finalText = needsNumber(rewrite)
      ? fillNumber(rewrite, provided)
      : rewrite;
    if (!finalText) {
      setError("Enter your own number before applying.");
      return;
    }
    if (hasUnsupportedNumbers(source, finalText, provided)) {
      setError(
        "The rewrite adds a number that is not in your CV. Add your own number instead.",
      );
      return;
    }
    onApply(finalText);
  }
  return { rewrite, error, busy, requestRewrite, accept };
}
