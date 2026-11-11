"use client";

import { useEffect, useRef } from "react";
import { useEditor } from "@tiptap/react";
import type { Editor, JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { contentHtml } from "@/lib/app-workspace/content";
import type { WorkspaceFix } from "@/lib/app-workspace/fixes";
import { AppSuggestionMark } from "@/components/app-workspace/suggestion-mark";

export function useAppWorkspaceEditorContent(
  source: string,
  draftContent: JSONContent | undefined,
  fixes: WorkspaceFix[],
  onChange: (content: Record<string, unknown>) => void,
  onEditor: (editor: Editor | null) => void,
) {
  const editedRef = useRef(false);
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
  return editor;
}
