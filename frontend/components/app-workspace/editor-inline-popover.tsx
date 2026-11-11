import type { Editor } from "@tiptap/core";
import { replaceDocumentText } from "@/lib/app-workspace/document-edit";
import type { useAppWorkspaceHighlight } from "@/hooks/use-app-workspace-highlight";
import { InlineEditPopover } from "./inline-edit-popover";

export function EditorInlinePopover({
  jobId,
  source,
  editor,
  highlight,
}: {
  jobId: string;
  source: string;
  editor: Editor | null;
  highlight: ReturnType<typeof useAppWorkspaceHighlight>;
}) {
  if (!highlight.selectedText || !highlight.rect) {
    return null;
  }
  return (
    <InlineEditPopover
      jobId={jobId}
      selectedText={highlight.selectedText}
      source={source}
      rect={highlight.rect}
      onClose={highlight.close}
      onApply={(text) => {
        if (replaceDocumentText(editor, highlight.selectedText, text)) {
          highlight.close();
        }
      }}
    />
  );
}
