"use client";

import { useRef } from "react";
import type { Editor, JSONContent } from "@tiptap/core";
import { useAppWorkspaceScrollAssist } from "@/hooks/use-app-workspace-scroll-assist";
import { useAppWorkspaceEditorContent } from "@/hooks/use-app-workspace-editor-content";
import { useAppWorkspaceHighlight } from "@/hooks/use-app-workspace-highlight";
import type { WorkspaceFix } from "@/lib/app-workspace/fixes";
import { EditorToolbar } from "./editor-toolbar";
import { EditorFrame } from "./editor-frame";
import { EditorInlinePopover } from "./editor-inline-popover";
import { ScrollMore } from "./scroll-more";
import styles from "./workspace-styles";

interface Props {
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
}: Props) {
  const frame = useRef<HTMLDivElement>(null);
  const editor = useAppWorkspaceEditorContent(
    source,
    draftContent,
    fixes,
    onChange,
    onEditor,
  );
  const highlight = useAppWorkspaceHighlight(jobId, fixes);
  const scroll = useAppWorkspaceScrollAssist(frame, jobId);
  return (
    <div className={styles.document} data-tour="workspace-editor">
      <EditorToolbar editor={editor} />
      <EditorFrame
        frame={frame}
        editor={editor}
        onSelection={highlight.onSelection}
        onHighlight={highlight.onHighlight}
      />
      <ScrollMore visible={scroll.hasMore} onClick={scroll.scrollMore} />
      <EditorInlinePopover
        jobId={jobId}
        source={source}
        editor={editor}
        highlight={highlight}
      />
    </div>
  );
}
