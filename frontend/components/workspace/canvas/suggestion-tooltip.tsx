"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import type { Editor } from "@tiptap/core";
import { Button } from "@/components/ui/button";

interface SuggestionTooltipProps {
  editor: Editor;
  suggestionId: string;
  suggestionText: string; // The recommendation text shown in tooltip
  replacementText: string; // afterText || text — used for Accept action
  anchorRect: DOMRect; // getBoundingClientRect() of the <mark> element
  onClose: () => void; // called after Accept or Dismiss
}

export function SuggestionTooltip({
  editor,
  suggestionId,
  suggestionText,
  replacementText,
  anchorRect,
  onClose,
}: SuggestionTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  function handleAccept() {
    const { doc } = editor.state;
    let from: number | null = null;
    let to: number | null = null;
    doc.descendants((node, pos) => {
      if (from !== null) { return false; }
      if (!node.isText) { return; }
      node.marks.forEach((mark) => {
        if (
          mark.type.name === "suggestionHighlight" &&
          mark.attrs.suggestionId === suggestionId
        ) {
          from = pos;
          to = pos + node.nodeSize;
        }
      });
    });
    if (from !== null && to !== null) {
      editor
        .chain()
        .focus()
        .deleteRange({ from, to })
        .insertContentAt(from, replacementText)
        .run();
      editor.commands.unsetSuggestionHighlight(suggestionId);
    }
    onClose();
  }

  function handleDismiss() {
    editor.commands.unsetSuggestionHighlight(suggestionId);
    onClose();
  }

  // Position above the mark, centered horizontally
  const top = anchorRect.top + window.scrollY - 8; // 8px gap above mark
  const left = anchorRect.left + anchorRect.width / 2;

  return createPortal(
    <div
      ref={tooltipRef}
      role="dialog"
      aria-label="AI suggestion"
      className="suggestion-tooltip-content pointer-events-auto fixed z-50 max-w-[280px] -translate-x-1/2 -translate-y-full rounded-[0.75rem] border border-border bg-white p-3 shadow-lg"
      style={{ top, left }}
    >
      <p className="mb-2 text-[13px] leading-5 text-[#141414]/80">
        {suggestionText}
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleAccept}
          className="h-7 bg-[#CAFF43]/20 px-3 text-xs font-bold text-[#141414] hover:bg-[#CAFF43]/40"
        >
          Accept
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDismiss}
          className="h-7 px-3 text-xs font-bold text-[#141414]/55 hover:bg-[#141414]/8"
        >
          Dismiss
        </Button>
      </div>
    </div>,
    document.body
  );
}
