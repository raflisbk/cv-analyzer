"use client";

import { useState, useCallback } from "react";
import type { JSONContent } from "@tiptap/core";
import type { WorkspaceHydration } from "@/lib/workspace";
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

export function CanvasEditor({ data }: CanvasEditorProps) {
  // Resolve sections from sections[] (fallback to source_text if no sections)
  const rawSections =
    data.document.sections.length > 0
      ? data.document.sections
      : data.document.source_text
        ? [{ type: "document", text: data.document.source_text, entities: [] }]
        : [];

  const [sections, setSections] = useState<SectionState[]>(() =>
    buildInitialSections(rawSections, null)
    // Wave 2: replace null with data.document.draft_content
  );

  const handleContentChange = useCallback(
    (sectionType: string, json: JSONContent) => {
      setSections((prev) =>
        prev.map((s) => (s.type === sectionType ? { ...s, json } : s))
      );
      // Wave 2: call markUnsaved({ sections: updatedMap }) here
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
        {/* Wave 2: UnsavedIndicator inserted here */}
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
