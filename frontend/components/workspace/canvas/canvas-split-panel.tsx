"use client";

import type { JSONContent } from "@tiptap/core";
import type { SaveState } from "@/hooks/use-draft-save";
import { CVPreview } from "./cv-preview";

interface SplitSection {
  type: string;
  json: JSONContent;
}

interface CanvasSplitPanelProps {
  editorSlot: React.ReactNode;
  sections: SplitSection[];
  fileName: string;
  saveState: SaveState;
}

export function CanvasSplitPanel({ editorSlot, sections, fileName, saveState }: CanvasSplitPanelProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      {/* Left pane — Editor (55% on desktop) */}
      <div className="min-w-0 flex-1 lg:basis-[55%]">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#141414]/40">
            Editor
          </p>
          <SaveIndicator saveState={saveState} />
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

function SaveIndicator({ saveState }: { saveState: SaveState }) {
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
          <span>Saved</span>
        </>
      )}
      {saveState === "error" && (
        <>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
          <span className="text-red-500">Save failed</span>
        </>
      )}
    </div>
  );
}
