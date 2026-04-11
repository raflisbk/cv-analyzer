"use client";

import { useRef, useState, useEffect } from "react";
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import type { JSONContent, Editor } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Skeleton } from "@/components/ui/skeleton";
import { SuggestionHighlight } from "@/lib/tiptap/suggestion-highlight";
import { EditorToolbar } from "./editor-toolbar";
import { SuggestionTooltip } from "./suggestion-tooltip";
import type { SuggestionItem } from "@/lib/types";

interface SectionBlockProps {
  sectionType: string;
  initialText: string;
  draftContent?: JSONContent | null;
  onContentChange: (sectionType: string, json: JSONContent) => void;
  suggestions?: SuggestionItem[];
}

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
}: SectionBlockProps) {
  const lastContentRef = useRef<string>("");
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltip | null>(null);

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
      if (relTarget?.closest(".suggestion-tooltip-content")) { return; } // mouse moved into tooltip
      setActiveTooltip(null);
    }

    container.addEventListener("mouseover", handleMouseOver);
    container.addEventListener("mouseout", handleMouseOut);
    return () => {
      container.removeEventListener("mouseover", handleMouseOver);
      container.removeEventListener("mouseout", handleMouseOut);
    };
  }, [suggestions]);

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
      {/* Section header row — Wave 3 adds reorder buttons + spacing toggle */}
      <header className="flex items-center gap-2 border-b border-border px-4 py-2">
        <span className="rounded-full bg-[#141414] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#F5F2D8]">
          {sectionType}
        </span>
      </header>

      {/* Formatting toolbar — visible on focus, hidden when unfocused */}
      <EditorToolbar editor={editor} isFocused={isFocused} />

      {/* Tiptap content area — 14px Inter, 1.6 line-height per UI-SPEC */}
      <div className="px-4 py-3">
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
            />
          )}
        </div>
      </div>
    </article>
  );
}
