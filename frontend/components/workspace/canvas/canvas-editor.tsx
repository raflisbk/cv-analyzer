"use client";

import { useState, useCallback } from "react";
import type { JSONContent } from "@tiptap/core";
import type { WorkspaceHydration } from "@/lib/workspace";
import { useDraftSave, type SaveState } from "@/hooks/use-draft-save";
import { SectionBlock } from "./section-block";
import { CanvasSplitPanel } from "./canvas-split-panel";
import {
  normalizeSuggestion,
  buildInitialSections,
  type SectionState,
  type SpacingValue,
} from "@/lib/workspace-utils";

interface CanvasEditorProps {
  data: WorkspaceHydration;
}

function _UnsavedIndicator({ saveState }: { saveState: SaveState }) {
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
          <span>Saving…</span>
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
  const rawSections =
    data.document.sections.length > 0
      ? data.document.sections
      : data.document.source_text
        ? [{ type: "document", text: data.document.source_text, entities: [] }]
        : [];

  const [sections, setSections] = useState<SectionState[]>(() =>
    buildInitialSections(rawSections, data.document.draft_content ?? null)
  );

  const { saveState, markUnsaved } = useDraftSave(data.job_id);

  const handleContentChange = useCallback(
    (sectionType: string, json: JSONContent) => {
      setSections((prev) => {
        const updated = prev.map((s) =>
          s.type === sectionType ? { ...s, json } : s
        );
        const sectionsMap = Object.fromEntries(
          updated.map((s) => [s.type, s.json])
        );
        markUnsaved({ sections: sectionsMap });
        return updated;
      });
    },
    [markUnsaved]
  );

  const handleReorder = useCallback(
    (index: number, direction: "up" | "down") => {
      setSections((prev) => {
        const swapIndex = direction === "up" ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= prev.length) { return prev; }
        const updated = [...prev];
        [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
        return updated;
      });
    },
    []
  );

  const handleSpacingChange = useCallback(
    (sectionType: string, spacing: SpacingValue) => {
      setSections((prev) =>
        prev.map((s) => (s.type === sectionType ? { ...s, spacing } : s))
      );
    },
    []
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
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[#141414]/45">
          Editor
        </p>
        <h2 className="font-display text-2xl font-extrabold text-[#141414]">
          {data.file.filename?.replace(/\.[^.]+$/, "") || "Uploaded CV"}
        </h2>
      </div>

      <CanvasSplitPanel
        sections={sections}
        fileName={data.file.filename ?? ""}
        saveState={saveState}
        jobId={data.job_id}
        editorSlot={sections.map((section, i) => (
          <SectionBlock
            key={section.type}
            sectionType={section.type}
            initialText={
              rawSections.find((s) => s.type === section.type)?.text ?? ""
            }
            draftContent={section.json}
            onContentChange={handleContentChange}
            suggestions={
              (data.analysis.suggestions
                ?.find(
                  (card) =>
                    card.section.toLowerCase() === section.type.toLowerCase()
                )
                ?.suggestions ?? []
              ).map((s) => normalizeSuggestion(s as unknown as Record<string, unknown>))
            }
            index={i}
            totalSections={sections.length}
            spacing={section.spacing}
            onReorder={handleReorder}
            onSpacingChange={handleSpacingChange}
          />
        ))}
      />
    </section>
  );
}
