"use client";

import type { JSONContent } from "@tiptap/core";
import { CVPreview } from "./cv-preview";

interface SplitSection {
  type: string;
  json: JSONContent;
}

interface CanvasSplitPanelProps {
  editorSlot: React.ReactNode;
  sections: SplitSection[];
  fileName: string;
}

export function CanvasSplitPanel({ editorSlot, sections, fileName }: CanvasSplitPanelProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      {/* Left pane — Editor (55% on desktop) */}
      <div className="min-w-0 flex-1 lg:basis-[55%]">
        <div className="mb-2 flex items-center px-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#141414]/40">
            Editor
          </p>
        </div>
        <div className="space-y-4">{editorSlot}</div>
      </div>

      {/* Right pane — Preview (45% on desktop) */}
      <div className="min-w-0 lg:basis-[45%]">
        <div className="mb-2 flex items-center px-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#141414]/40">
            Preview
          </p>
        </div>
        <div className="lg:sticky lg:top-6">
          <CVPreview sections={sections} fileName={fileName} />
        </div>
      </div>
    </div>
  );
}
