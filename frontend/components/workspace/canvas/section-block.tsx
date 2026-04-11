"use client";

import { useRef } from "react";
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import type { JSONContent } from "@tiptap/core";
import { Skeleton } from "@/components/ui/skeleton";
import { SuggestionHighlight } from "@/lib/tiptap/suggestion-highlight";

interface SectionBlockProps {
  sectionType: string;
  initialText: string;
  draftContent?: JSONContent | null;
  onContentChange: (sectionType: string, json: JSONContent) => void;
  // Wave 2 will pass suggestions; Wave 1 ignores them
  suggestions?: import("@/lib/types").SuggestionItem[];
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

export function SectionBlock({
  sectionType,
  initialText,
  draftContent,
  onContentChange,
}: SectionBlockProps) {
  const lastContentRef = useRef<string>("");

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
    onUpdate: ({ editor }) => {
      // Only fire on actual content changes — not cursor moves
      const json = JSON.stringify(editor.getJSON());
      if (json !== lastContentRef.current) {
        lastContentRef.current = json;
        onContentChange(sectionType, editor.getJSON());
      }
    },
  });

  // Track focus state reactively via useEditorState (editor.isFocused is not reactive in v3)
  const { isFocused } = useEditorState({
    editor,
    selector: ({ editor: e }) => ({ isFocused: e?.isFocused ?? false }),
  }) ?? { isFocused: false };

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

      {/* Toolbar placeholder slot — Wave 2 inserts EditorToolbar here */}
      {/* <EditorToolbar editor={editor} isFocused={isFocused} /> */}

      {/* Tiptap content area — 14px Inter, 1.6 line-height per UI-SPEC */}
      <div className="px-4 py-3">
        <EditorContent
          editor={editor}
          className="prose-none min-h-[60px] text-sm leading-[1.6] text-[#0A0A0A] outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-[#141414]/40 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"
        />
      </div>
    </article>
  );
}
