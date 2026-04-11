"use client";

import { useMemo } from "react";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import type { JSONContent } from "@tiptap/core";

// IMPORTANT: Do NOT include SuggestionHighlight — preview must be mark-free (clean CV view)
const PREVIEW_EXTENSIONS = [StarterKit];

interface PreviewSection {
  type: string;
  json: JSONContent;
}

interface CVPreviewProps {
  sections: PreviewSection[];
  fileName: string;
}

function SectionPreview({ type, json }: PreviewSection) {
  const html = useMemo(() => {
    try {
      return generateHTML(json, PREVIEW_EXTENSIONS);
    } catch {
      return "";
    }
  }, [json]);

  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center gap-3">
        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F5F2D8]/50">
          {type}
        </span>
        <div className="h-px flex-1 bg-[#F5F2D8]/15" />
      </div>
      <div
        className="preview-content text-sm leading-[1.5] text-[#F5F2D8]/85 [&_p]:mb-1 [&_ul]:ml-4 [&_ul]:list-disc [&_ol]:ml-4 [&_ol]:list-decimal [&_strong]:font-semibold [&_em]:italic"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export function CVPreview({ sections, fileName }: CVPreviewProps) {
  const displayName = fileName.replace(/\.[^.]+$/, "") || "Your CV";

  if (sections.length === 0) {
    return (
      <div className="rounded-[2rem] bg-[#141414] px-8 py-10">
        <p className="text-sm text-[#F5F2D8]/45">
          Start editing sections to see the preview.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] bg-[#141414] px-8 py-10">
      <h1 className="font-display text-[22px] font-extrabold leading-[1.1] text-[#F5F2D8]">
        {displayName}
      </h1>
      {sections.map((section) => (
        <SectionPreview key={section.type} type={section.type} json={section.json} />
      ))}
    </div>
  );
}
