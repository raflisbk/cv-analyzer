"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SuggestionAnchorRecord } from "@/lib/workspace";
import { SuggestionMark } from "./suggestion-mark";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import { SuggestionCard } from "./suggestion-card";
import { InlineAIPopup } from "./inline-ai-popup";

interface RichTextEditorProps {
  content: string;
  anchors?: SuggestionAnchorRecord[];
  suggestions?: any[];
  onContentChange?: (content: string) => void;
  onExportPdf?: () => void;
  className?: string;
}

export function RichTextEditor({
  content,
  anchors = [],
  suggestions = [],
  onContentChange,
  onExportPdf,
  className = "",
}: RichTextEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [htmlWithHighlights, setHtmlWithHighlights] = useState(content);
  const [isExporting, setIsExporting] = useState(false);

  const setActiveSuggestionId = useWorkspaceV2Store((s) => s.setActiveSuggestionId);
  const activeSuggestionId = useWorkspaceV2Store((s) => s.activeSuggestionId);
  const _suggestionStatuses = useWorkspaceV2Store((s) => s.suggestionStatuses);

  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      bulletList: { keepMarks: true },
      orderedList: { keepMarks: true },
    }),
    Underline,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Link.configure({ openOnClick: false }),
    SuggestionMark,
    Placeholder.configure({
      placeholder: "Ketik atau tempel teks CV Anda di sini...",
    }),
  ], []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: htmlWithHighlights,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onContentChange?.(html);
    },
    onCreate: () => {
      setIsLoading(false);
    },
  });

  useEffect(() => {
    let highlighted = content;

    if (content && anchors.length > 0) {
      const suggestionMap = new Map<string, { text: string; afterText?: string; section: string; priority: string }>();
      for (const card of suggestions || []) {
        card.suggestions?.forEach((item: any, idx: number) => {
          const suggestionId = `${card.section}_${idx}_0`;
          suggestionMap.set(suggestionId, {
            text: item.text,
            afterText: item.afterText || item.explanation,
            section: card.section,
            priority: item.priority,
          });
        });
      }

      for (const anchor of anchors) {
        const suggestion = suggestionMap.get(anchor.suggestion_id);
        if (!suggestion) {
          continue;
        }

        const textToHighlight = anchor.text_anchor;
        if (!textToHighlight) {
          continue;
        }

    const escapedText = textToHighlight.replace(/[.*+?^{}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escapedText, "gi");

        highlighted = highlighted.replace(regex, (match) => {
          return `<span data-suggestion-id="${anchor.suggestion_id}" data-priority="${anchor.priority}" data-section="${suggestion.section}" class="suggestion-highlight" style="background: ${anchor.priority === 'high_impact' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'}; border-bottom: 2px solid ${anchor.priority === 'high_impact' ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.5)'}; border-radius: 2px; cursor: pointer; padding: 2px 0;">${match}</span>`;
        });
      }
    }

    if (editor) {
      editor.commands.setContent(highlighted);
    }
    setHtmlWithHighlights(highlighted);
  }, [content, anchors, suggestions, editor]);

  const handleHighlightMouseEnter = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const suggestionId = target.getAttribute('data-suggestion-id');
    if (suggestionId) {
      setActiveSuggestionId(suggestionId);
    }
  }, [setActiveSuggestionId]);

  const handleHighlightMouseLeave = useCallback(() => {
    setActiveSuggestionId(null);
  }, [setActiveSuggestionId]);

  const handleApplyImprovement = useCallback((originalText: string, improvedText: string) => {
    if (!editor) {
      return;
    }

    const { from, to } = editor.state.selection;
    const currentText = editor.state.doc.textBetween(from, to);

    if (currentText === originalText) {
      editor.chain().focus().deleteSelection().insertContent(improvedText).run();
    } else {
      const docText = editor.getText();
      const index = docText.indexOf(originalText);
      if (index !== -1) {
        editor.chain()
          .focus()
          .deleteRange({ from: index, to: index + originalText.length })
          .insertContentAt(index, improvedText)
          .run();
      }
    }
  }, [editor]);

  const handleExportPdf = useCallback(async () => {
    if (!editor || isExporting) {
      return;
    }

    setIsExporting(true);
    try {
      const html = editor.getHTML();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/export/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html,
          filename: "cv-optimized.pdf",
        }),
      });

      if (!response.ok) {
        throw new Error("PDF export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cv-optimized.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onExportPdf?.();
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [editor, isExporting, onExportPdf]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const editorElement = editor.view.dom;
    editorElement.addEventListener('mouseover', handleHighlightMouseEnter);
    editorElement.addEventListener('mouseout', handleHighlightMouseLeave);

    return () => {
      editorElement.removeEventListener('mouseover', handleHighlightMouseEnter);
      editorElement.removeEventListener('mouseout', handleHighlightMouseLeave);
    };
  }, [editor, handleHighlightMouseEnter, handleHighlightMouseLeave]);

  if (!editor || isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-[rgba(17,17,17,0.02)]">
        <div className="text-sm text-[rgba(17,17,17,0.45)]">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      <div className="sticky top-0 z-10 flex items-center gap-1 p-2 bg-white border-b border-[rgba(17,17,17,0.08)]">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          tooltip="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          tooltip="Italic (Ctrl+I)"
        >
          <em>I</em>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          tooltip="Underline (Ctrl+U)"
        >
          <u>U</u>
        </ToolbarButton>

        <div className="w-px h-6 bg-[rgba(17,17,17,0.1)] mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          tooltip="Heading 1"
        >
          H1
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          tooltip="Heading 2"
        >
          H2
        </ToolbarButton>

        <div className="w-px h-6 bg-[rgba(17,17,17,0.1)] mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          tooltip="Bullet List"
        >
          •
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          tooltip="Numbered List"
        >
          1.
        </ToolbarButton>

        <div className="flex-1" />

        <button
          type="button"
          onClick={handleExportPdf}
          disabled={isExporting}
          className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#111] text-white hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isExporting ? (
            <>
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Exporting...
            </>
          ) : (
            "Export PDF"
          )}
        </button>
      </div>

      <div className="relative min-h-[800px] bg-[#FFFDF4]">
        <EditorContent
          editor={editor}
          className={[
            "min-h-[600px] outline-none",
            "[&_.ProseMirror]:px-8 [&_.ProseMirror]:py-6",
            "[&_.ProseMirror]:text-[14px] [&_.ProseMirror]:leading-[1.7] [&_.ProseMirror]:text-[#1a1a1a]",
            "[&_.ProseMirror]:outline-none",
            "[&_.ProseMirror_h1]:text-[18px] [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:text-[#111]",
            "[&_.ProseMirror_h1]:mt-0 [&_.ProseMirror_h1]:mb-2 [&_.ProseMirror_h1]:pb-1",
            "[&_.ProseMirror_h1]:border-b-2 [&_.ProseMirror_h1]:border-[#111]",
            "[&_.ProseMirror_h2]:text-[13px] [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:uppercase",
            "[&_.ProseMirror_h2]:tracking-[0.1em] [&_.ProseMirror_h2]:text-[#111]",
            "[&_.ProseMirror_h2]:mt-5 [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h2]:pb-1",
            "[&_.ProseMirror_h2]:border-b [&_.ProseMirror_h2]:border-[#ccc]",
            "[&_.ProseMirror_p]:my-[3px] [&_.ProseMirror_p:first-child]:mt-0",
            "[&_.ProseMirror_strong]:font-semibold [&_.ProseMirror_strong]:text-[#0a0a0a]",
            "[&_.ProseMirror_ul]:ml-5 [&_.ProseMirror_ul]:my-1 [&_.ProseMirror_ul]:list-disc",
            "[&_.ProseMirror_ul_li]:mb-[2px] [&_.ProseMirror_ul_li_p]:my-0",
            "[&_.ProseMirror_ol]:ml-5 [&_.ProseMirror_ol]:my-1 [&_.ProseMirror_ol]:list-decimal",
            "[&_.ProseMirror_ol_li]:mb-[2px] [&_.ProseMirror_ol_li_p]:my-0",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-[#141414]/40",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
          ].join(" ")}
        />

        {activeSuggestionId && (
          <div className="absolute z-50 pointer-events-none">
            <SuggestionCard
              suggestionId={activeSuggestionId}
              suggestions={suggestions}
              onClose={() => setActiveSuggestionId(null)}
            />
          </div>
        )}

        <InlineAIPopup onApplyImprovement={handleApplyImprovement} />
      </div>
    </div>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  active: boolean;
  tooltip: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, tooltip, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={tooltip}
      className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
        active
          ? "bg-[#111] text-white"
          : "text-[rgba(17,17,17,0.6)] hover:bg-[rgba(17,17,17,0.06)]"
      }`}
    >
      {children}
    </button>
  );
}
