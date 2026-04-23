"use client";
/**
 * RichTextEditor — Tiptap-based editor with PDF layout preservation.
 * Phase 17: Replaces PDF canvas viewer with editable rich text.
 *
 * Features:
 * - Exact PDF positioning via absolute positioned blocks
 * - WYSIWYG editing with formatting toolbar
 * - Suggestion highlights integration (text-based marks)
 * - Inline AI improvement popup
 * - Export to PDF
 */
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect, useState } from "react";
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
  const suggestionStatuses = useWorkspaceV2Store((s) => s.suggestionStatuses);

  // Apply suggestion highlights to HTML content
  useEffect(() => {
    if (!content || anchors.length === 0) {
      setHtmlWithHighlights(content);
      return;
    }

    // Create a map for quick suggestion lookup
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

    // Apply highlights by replacing text matches with marked spans
    let highlighted = content;
    for (const anchor of anchors) {
      const suggestion = suggestionMap.get(anchor.suggestion_id);
      if (!suggestion) continue;

      const textToHighlight = anchor.text_anchor;
      if (!textToHighlight) continue;

      // Escape special regex characters
      const escapedText = textToHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedText, 'gi');

      // Replace with marked span
      highlighted = highlighted.replace(regex, (match) => {
        return `<span data-suggestion-id="${anchor.suggestion_id}" data-priority="${anchor.priority}" data-section="${suggestion.section}" class="suggestion-highlight" style="background: ${anchor.priority === 'high_impact' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'}; border-bottom: 2px solid ${anchor.priority === 'high_impact' ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.5)'}; border-radius: 2px; cursor: pointer; padding: 2px 0;">${match}</span>`;
      });
    }

    setHtmlWithHighlights(highlighted);
  }, [content, anchors, suggestions]);

  const editor = useEditor({
    extensions: [
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
    ],
    content: htmlWithHighlights,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onContentChange?.(html);
    },
    onCreate: () => {
      setIsLoading(false);
    },
  });

  // Handle hover on suggestion highlights
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

  // Handle AI improvement - replace selected text with improved version
  const handleApplyImprovement = useCallback((originalText: string, improvedText: string) => {
    if (!editor) return;

    // Find and replace the selected text
    const { from, to } = editor.state.selection;
    const currentText = editor.state.doc.textBetween(from, to);

    if (currentText === originalText) {
      editor.chain().focus().deleteSelection().insertContent(improvedText).run();
    } else {
      // Fallback: search for the text and replace first occurrence
      const docText = editor.getText();
      const index = docText.indexOf(originalText);
      if (index !== -1) {
        const pos = editor.state.doc.resolve(index + 1);
        editor.chain()
          .focus()
          .deleteRange({ from: index, to: index + originalText.length })
          .insertContentAt(index, improvedText)
          .run();
      }
    }
  }, [editor]);

  // Handle PDF export
  const handleExportPdf = useCallback(async () => {
    if (!editor || isExporting) return;

    setIsExporting(true);
    try {
      const html = editor.getHTML();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/export/pdf`, {
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

  // Attach event listeners for suggestion highlights
  useEffect(() => {
    if (!editor) return;

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
      {/* Formatting Toolbar */}
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

      {/* Editor Content Area */}
      <div className="relative min-h-[800px] bg-[#FFFDF4]">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none p-6"
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        />

        {/* Suggestion Card Popup */}
        {activeSuggestionId && (
          <div className="absolute z-50 pointer-events-none">
            <SuggestionCard
              suggestionId={activeSuggestionId}
              suggestions={suggestions}
              onClose={() => setActiveSuggestionId(null)}
            />
          </div>
        )}

        {/* Inline AI Improvement Popup */}
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
