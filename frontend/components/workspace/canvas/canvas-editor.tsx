"use client";

import { useState, useCallback } from "react";
import type { JSONContent } from "@tiptap/core";
import type { WorkspaceHydration } from "@/lib/workspace";
import { useDraftSave, type SaveState } from "@/hooks/use-draft-save";
import { SectionBlock, plainTextToTiptapDoc } from "./section-block";

interface CanvasEditorProps {
  data: WorkspaceHydration;
}

interface SectionState {
  type: string;
  json: JSONContent;
}

function buildInitialSections(
  sections: WorkspaceHydration["document"]["sections"],
  draftContent?: Record<string, JSONContent> | null
): SectionState[] {
  return sections.map((section) => ({
    type: section.type,
    json: draftContent?.[section.type] ?? plainTextToTiptapDoc(section.text),
  }));
}

function UnsavedIndicator({ saveState }: { saveState: SaveState }) {
  if (saveState === "idle") { return null; }

  return (
    <div className="flex items-center gap-1.5 text-[10px] text-[#141414]/55">
      {saveState === "unsaved" && (
        <>
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF8C42]" />
          <span>Unsaved changes</span>
        </>
      )}
      {saveState === "saving" && (
        <>
          <span className="inline-block h-1.5 w-1.5 animate-spin rounded-full border border-[#141414]/40 border-t-[#141414]" />
          <span>Unsaved changes</span>
        </>
      )}
      {saveState === "saved" && (
        <>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#CAFF43]" />
          <span className="opacity-70">Saved</span>
        </>
      )}
      {saveState === "error" && (
        <>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-destructive" />
          <span className="text-destructive">Save failed</span>
        </>
      )}
    </div>
  );
}

export function CanvasEditor({ data }: CanvasEditorProps) {
  // Resolve sections from sections[] (fallback to source_text if no sections)
  const rawSections =
    data.document.sections.length > 0
      ? data.document.sections
      : data.document.source_text
        ? [{ type: "document", text: data.document.source_text, entities: [] }]
        : [];

  const [sections, setSections] = useState<SectionState[]>(() =>
    // D-12: load draft_content if previously saved, else use parsed text
    buildInitialSections(rawSections, data.document.draft_content ?? null)
  );

  const { saveState, markUnsaved } = useDraftSave(data.job_id);

  const handleContentChange = useCallback(
    (sectionType: string, json: JSONContent) => {
      setSections((prev) => {
        const updated = prev.map((s) =>
          s.type === sectionType ? { ...s, json } : s
        );
        // Build sections map for PATCH body (D-10, D-11)
        const sectionsMap = Object.fromEntries(
          updated.map((s) => [s.type, s.json])
        );
        markUnsaved({ sections: sectionsMap });
        return updated;
      });
    },
    [markUnsaved]
  );

  if (rawSections.length === 0) {
    return (
      <div className="rounded-[1rem] border border-border bg-white/60 p-6 text-sm text-[#141414]/65">
        No sections found for this CV. The workspace is still preparing content.
      </div>
    );
  }

  return (
    <section className="p-4">
      {/* Editor pane header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#141414]/45">
            Editor
          </p>
          <h2 className="font-display text-2xl font-extrabold text-[#141414]">
            {data.file.filename?.replace(/\.[^.]+$/, "") || "Uploaded CV"}
          </h2>
        </div>
        <UnsavedIndicator saveState={saveState} />
      </div>

      {/* Section blocks — Wave 3 wraps this in CanvasSplitPanel */}
      <div className="space-y-4">
        {sections.map((section) => (
          <SectionBlock
            key={section.type}
            sectionType={section.type}
            initialText={
              rawSections.find((s) => s.type === section.type)?.text ?? ""
            }
            draftContent={section.json}
            onContentChange={handleContentChange}
            suggestions={
              data.analysis.suggestions
                ?.find(
                  (card) =>
                    card.section.toLowerCase() === section.type.toLowerCase()
                )
                ?.suggestions ?? []
            }
          />
        ))}
      </div>
    </section>
  );
}
