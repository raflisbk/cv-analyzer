"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";
import type { JSONContent } from "@tiptap/core";

export type SaveState = "idle" | "unsaved" | "saving" | "saved" | "error";

interface DraftContent {
}

async function patchWorkspaceContent(
  jobId: string,
  content: DraftContent
): Promise<void> {
  const res = await fetch(`/api/v1/jobs/${jobId}/workspace/content`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content),
  });
  if (!res.ok) {
    throw new Error(`Save failed: ${res.status}`);
  }
}

export function useDraftSave(jobId: string) {
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const { mutate } = useMutation({
    mutationFn: (content: DraftContent) =>
      patchWorkspaceContent(jobId, content),
    onMutate: () => {
      setSaveState("saving");
    },
    onSuccess: () => {
      setSaveState("saved");
      // Auto-clear "saved" indicator after 1.5s per UI-SPEC save state contract
      setTimeout(() => setSaveState("idle"), 1500);
    },
    onError: () => {
      setSaveState("error");
      // Toast copy from UI-SPEC copywriting contract
      toast.error(
        "Failed to save changes — your edits are not lost. Retrying..."
      );
    },
  });

  // 800ms debounce, force flush after 5s of continuous typing (maxWait)
  const debouncedSave = useDebouncedCallback(
    (content: DraftContent) => {
      mutate(content);
    },
    800,
    { maxWait: 5000 }
  );

  const markUnsaved = useCallback(
    (content: DraftContent) => {
      setSaveState("unsaved");
      debouncedSave(content);
    },
    [debouncedSave]
  );

  return { saveState, markUnsaved };
}
