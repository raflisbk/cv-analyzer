"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor } from "@tiptap/react";
import type { Editor, JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { useInlineEdit } from "@/hooks/use-inline-edit";
import { useAppWorkspaceScrollAssist } from "@/hooks/use-app-workspace-scroll-assist";
import { contentHtml } from "@/lib/app-workspace/content";
import { replaceDocumentText } from "@/lib/app-workspace/document-edit";
import type { WorkspaceFix } from "@/lib/app-workspace/fixes";
import { AppSuggestionMark } from "./suggestion-mark";
import { InlineEditPopover } from "./inline-edit-popover";
import { EditorToolbar } from "./editor-toolbar";
import { EditorFrame } from "./editor-frame";
import { ScrollMore } from "./scroll-more";
import styles from "./workspace-styles";

interface WorkspaceEditorProps {
  jobId: string;
  source: string;
  draftContent?: JSONContent;
  fixes: WorkspaceFix[];
  onChange: (content: Record<string, unknown>) => void;
  onEditor: (editor: Editor | null) => void;
}

export function WorkspaceEditor({
  jobId,
  source,
  draftContent,
  fixes,
  onChange,
  onEditor,
}: WorkspaceEditorProps) {
  const frame = useRef<HTMLDivElement>(null);
  const [activeFix, setActiveFix] = useState<WorkspaceFix | null>(null);
  const [fixRect, setFixRect] = useState<DOMRect | null>(null);
  const editedRef = useRef(false);
  const inline = useInlineEdit(jobId);
  const scroll = useAppWorkspaceScrollAssist(frame, jobId);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, AppSuggestionMark],
    content: "<p></p>",
    onUpdate: ({ editor: current }) => {
      editedRef.current = true;
      onChange(current.getJSON());
    },
  });
  useEffect(() => {
    onEditor(editor);
    return () => onEditor(null);
  }, [editor, onEditor]);
  useEffect(() => {
    if (editor && (source || draftContent) && !editedRef.current) {
      editor.commands.setContent(draftContent ?? contentHtml(source, fixes), {
        emitUpdate: false,
      });
    }
  }, [editor, source, fixes, draftContent]);
  const selectedText = activeFix?.before ?? inline.state.selectedText;
  const rect = fixRect ?? inline.state.selectionRect;
  return (
    <div className={styles.document} data-tour="workspace-editor">
      <EditorToolbar editor={editor} />
      <EditorFrame
        frame={frame}
        editor={editor}
        onSelection={inline.handleSelectionChange}
        onHighlight={(target) => {
          const fix = fixes.find((item) => item.id === target?.dataset.fixId);
          if (fix) {
            setActiveFix(fix);
            setFixRect(target.getBoundingClientRect());
          }
        }}
      />
      <ScrollMore visible={scroll.hasMore} onClick={scroll.scrollMore} />
      {selectedText && rect && (
        <InlineEditPopover
          jobId={jobId}
          selectedText={selectedText}
          source={source}
          rect={rect}
          onClose={() => {
            setActiveFix(null);
            setFixRect(null);
            inline.closePopover();
          }}
          onApply={(text) => {
            if (replaceDocumentText(editor, selectedText, text)) {
              setActiveFix(null);
              setFixRect(null);
              inline.closePopover();
            }
          }}
        />
      )}
    </div>
  );
}
