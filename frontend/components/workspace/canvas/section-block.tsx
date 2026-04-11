"use client";

import { useRef, useState, useEffect } from "react";
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import type { JSONContent, Editor } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SuggestionHighlight } from "@/lib/tiptap/suggestion-highlight";
import { EditorToolbar } from "./editor-toolbar";
import { SuggestionTooltip } from "./suggestion-tooltip";
import type { SuggestionItem } from "@/lib/types";

type SpacingValue = "compact" | "normal" | "spacious";

interface SectionBlockProps {
  sectionType: string;
  initialText: string;
  draftContent?: JSONContent | null;
  onContentChange: (sectionType: string, json: JSONContent) => void;
  suggestions?: SuggestionItem[];
  index: number;
  totalSections: number;
  spacing: SpacingValue;
  onReorder: (index: number, direction: "up" | "down") => void;
  onSpacingChange: (sectionType: string, spacing: SpacingValue) => void;
}

const SPACING_PADDING: Record<SpacingValue, string> = {
  compact: "py-1",
  normal: "py-3",
  spacious: "py-6",
};

/** Convert plain text (with newlines) to a Tiptap-compatible doc JSONContent */
export function plainTextToTiptapDoc(text: string): JSONContent {
  const lines = text.split("\n");
  return {
    type: "doc",
    content: lines.map((line) => ({
      type: "paragraph",
      content: line.trim() ? [{ type: "text", text: line }] : [],
    })),
  };
}

// ─── Stabilo highlight utilities ────────────────────────────────────────────

function findTextRange(
  doc: ProseMirrorNode,
  searchText: string
): { from: number; to: number } | null {
  let result: { from: number; to: number } | null = null;
  doc.descendants((node: ProseMirrorNode, pos: number) => {
    if (result) { return false; }
    if (!node.isText || !node.text) { return; }
    const index = node.text.indexOf(searchText);
    if (index !== -1) {
      result = { from: pos + index, to: pos + index + searchText.length };
      return false;
    }
  });
  return result;
}

function getSuggestionColor(item: SuggestionItem): string {
  if (item.priority === "high_impact") { return "#FF4FCB"; }
  if (item.type === "action_verb" || item.type === "impact_metric") { return "#FF8C42"; }
  return "#CAFF43"; // quick_win default
}

function applyHighlights(editor: Editor, suggestions: SuggestionItem[]) {
  suggestions.forEach((suggestion) => {
    if (!suggestion.originalText) { return; } // no anchor phrase — skip silently
    const range = findTextRange(editor.state.doc, suggestion.originalText);
    if (!range) { return; } // phrase not found in this section — skip gracefully

    const color = getSuggestionColor(suggestion);
    editor
      .chain()
      .setTextSelection(range)
      .setSuggestionHighlight({
        suggestionId: suggestion.text, // use suggestion text as unique ID
        color,
      })
      .run();
  });
  // Deselect after applying all marks
  editor.commands.setTextSelection(0);
}

// ─── ActiveTooltip state shape ───────────────────────────────────────────────

interface ActiveTooltip {
  suggestionId: string;
  item: SuggestionItem;
  anchorRect: DOMRect;
}

// ─── SectionBlock component ──────────────────────────────────────────────────

export function SectionBlock({
  sectionType,
  initialText,
  draftContent,
  onContentChange,
  suggestions,
  index,
  totalSections,
  spacing,
  onReorder,
  onSpacingChange,
}: SectionBlockProps) {
  const lastContentRef = useRef<string>("");
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltip | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleClose() {
    closeTimerRef.current = setTimeout(() => setActiveTooltip(null), 500);
  }

  function cancelClose() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  const editor = useEditor({
    immediatelyRender: false, // CRITICAL: prevents Next.js 15 SSR throw
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start editing this section...",
      }),
      SuggestionHighlight,
    ],
    // Set content ONCE at init — never bind to React state (prevents cursor jump)
    content: draftContent ?? plainTextToTiptapDoc(initialText),
    onCreate: ({ editor: e }) => {
      if (suggestions && suggestions.length > 0) {
        // Defer by one tick so the doc is fully parsed before applying marks
        setTimeout(() => applyHighlights(e, suggestions), 0);
      }
    },
    onUpdate: ({ editor: e }) => {
      // Only fire on actual content changes — not cursor moves
      const json = JSON.stringify(e.getJSON());
      if (json !== lastContentRef.current) {
        lastContentRef.current = json;
        onContentChange(sectionType, e.getJSON());
      }
    },
  });

  // Track focus state reactively via useEditorState (editor.isFocused is not reactive in v3)
  const { isFocused } = useEditorState({
    editor,
    selector: ({ editor: e }) => ({ isFocused: e?.isFocused ?? false }),
  }) ?? { isFocused: false };

  // Event delegation for stabilo mark hovers — ProseMirror DOM nodes can't be wrapped by React
  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container || !suggestions?.length) { return; }

    function handleMouseOver(e: MouseEvent) {
      const mark = (e.target as Element).closest(
        "[data-suggestion-id]"
      ) as HTMLElement | null;
      if (!mark) { return; }
      const sid = mark.getAttribute("data-suggestion-id");
      const item = suggestions!.find((s) => s.text === sid);
      if (!item) { return; }
      setActiveTooltip({
        suggestionId: sid!,
        item,
        anchorRect: mark.getBoundingClientRect(),
      });
    }

    function handleMouseOut(e: MouseEvent) {
      const relTarget = e.relatedTarget as Element | null;
      if (relTarget?.closest(".suggestion-tooltip-content")) { return; }
      scheduleClose();
    }

    container.addEventListener("mouseover", handleMouseOver);
    container.addEventListener("mouseout", handleMouseOut);
    return () => {
      container.removeEventListener("mouseover", handleMouseOver);
      container.removeEventListener("mouseout", handleMouseOut);
    };
  }, [suggestions, editor]);

  // null during SSR hydration — show skeleton per UI-SPEC
  if (!editor) {
    return (
      <div className="space-y-2 rounded-[1rem] border border-border p-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    );
  }

  return (
    <article
      className={`rounded-[1rem] border transition-colors duration-150 ${
        isFocused
          ? "border-[#CAFF43]/60 bg-white"
          : "border-border bg-white/80"
      }`}
    >
      {/* Section header row — reorder buttons + spacing toggle */}
      <header className="flex items-center gap-2 border-b border-border px-4 py-2">
        <span className="rounded-full bg-[#141414] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#F5F2D8]">
          {sectionType}
        </span>

        <div className="ml-auto flex items-center gap-1">
          {/* Spacing selector */}
          <select
            aria-label="Section spacing"
            value={spacing}
            onChange={(e) =>
              onSpacingChange(sectionType, e.target.value as SpacingValue)
            }
            className="rounded-md border border-border bg-transparent px-1.5 py-0.5 text-[10px] text-[#141414]/60 focus:outline-none focus:ring-1 focus:ring-[#CAFF43]"
          >
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="spacious">Spacious</option>
          </select>

          {/* Move up */}
          <button
            type="button"
            aria-label="Move section up"
            disabled={index === 0}
            onClick={() => onReorder(index, "up")}
            className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-[#141414]/8 ${
              index === 0 ? "cursor-not-allowed opacity-30" : ""
            }`}
          >
            <ChevronUp className="h-4 w-4" />
          </button>

          {/* Move down */}
          <button
            type="button"
            aria-label="Move section down"
            disabled={index === totalSections - 1}
            onClick={() => onReorder(index, "down")}
            className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-[#141414]/8 ${
              index === totalSections - 1 ? "cursor-not-allowed opacity-30" : ""
            }`}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Formatting toolbar — visible on focus, hidden when unfocused */}
      <EditorToolbar editor={editor} isFocused={isFocused} />

      {/* Tiptap content area — spacing controlled by prop */}
      <div className={`px-4 ${SPACING_PADDING[spacing]}`}>
        {/* Wrap EditorContent with ref for event delegation */}
        <div ref={editorContainerRef} className="relative">
          <EditorContent
            editor={editor}
            className="prose-none min-h-[60px] text-sm leading-[1.6] text-[#0A0A0A] outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-[#141414]/40 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"
          />
          {activeTooltip && editor && (
            <SuggestionTooltip
              editor={editor}
              suggestionId={activeTooltip.suggestionId}
              suggestionText={activeTooltip.item.text}
              replacementText={
                activeTooltip.item.afterText ?? activeTooltip.item.text
              }
              anchorRect={activeTooltip.anchorRect}
              onClose={() => setActiveTooltip(null)}
              onMouseEnter={cancelClose}
              onMouseLeave={() => setActiveTooltip(null)}
            />
          )}
        </div>
      </div>
    </article>
  );
}
