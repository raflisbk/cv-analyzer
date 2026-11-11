"use client";

import { useState } from "react";
import { useInlineEdit } from "@/hooks/use-inline-edit";
import type { WorkspaceFix } from "@/lib/app-workspace/fixes";

export function useAppWorkspaceHighlight(jobId: string, fixes: WorkspaceFix[]) {
  const [activeFix, setActiveFix] = useState<WorkspaceFix | null>(null);
  const [fixRect, setFixRect] = useState<DOMRect | null>(null);
  const inline = useInlineEdit(jobId);
  function onHighlight(target: HTMLElement) {
    const fix = fixes.find((item) => item.id === target.dataset.fixId);
    if (fix) {
      setActiveFix(fix);
      setFixRect(target.getBoundingClientRect());
    }
  }
  function close() {
    setActiveFix(null);
    setFixRect(null);
    inline.closePopover();
  }
  return {
    selectedText: activeFix?.before ?? inline.state.selectedText,
    rect: fixRect ?? inline.state.selectionRect,
    onHighlight,
    close,
    onSelection: inline.handleSelectionChange,
  };
}
