import type { useAppWorkspaceData } from "@/hooks/use-app-workspace-data";
import type { useAppWorkspaceEdits } from "@/hooks/use-app-workspace-edits";
import type { useDraftSave } from "@/hooks/use-draft-save";
import { WorkspaceEditor } from "./workspace-editor";

export function WorkspaceEditorContainer({
  jobId,
  data,
  edits,
  draft,
}: {
  jobId: string;
  data: ReturnType<typeof useAppWorkspaceData>;
  edits: ReturnType<typeof useAppWorkspaceEdits>;
  draft: ReturnType<typeof useDraftSave>;
}) {
  const hydration = data.hydration.data;
  return (
    <WorkspaceEditor
      jobId={jobId}
      source={hydration?.document.source_text ?? ""}
      draftContent={hydration?.document.draft_content?.document}
      fixes={edits.fixes}
      onChange={(content) =>
        draft.markUnsaved({ sections: { document: content } })
      }
      onEditor={edits.setEditor}
    />
  );
}
