/**
 * Shared workspace utility functions.
 * Diekstrak dari canvas-editor.tsx dan section-block.tsx pada Phase 13
 * agar dapat dibagikan antara workspace-v1 (canvas) dan workspace-v2.
 *
 * PENTING: Jangan ubah behavior function ini — canvas editor bergantung padanya.
 */
import type { JSONContent } from "@tiptap/core";
import type { WorkspaceHydration } from "@/lib/workspace";
import type { SuggestionItem } from "@/lib/types";

export type SpacingValue = "compact" | "normal" | "spacious";

export interface SectionState {
  type: string;
  json: JSONContent;
  spacing: SpacingValue;
}

/** Konversi plain text (dengan newlines) ke Tiptap-compatible doc JSONContent */
export function plainTextToTiptapDoc(text: string): JSONContent {
  const lines = text.split("\n");
  return {
    type: "doc",
    content: lines.map((line) => ({
      type: "paragraph",
      content: line.trim() ? [{ type: "text", text: line }] : [],
    })),
  };
}

/** Normalisasi raw API suggestion item — backend mengirim snake_case, frontend mengharapkan camelCase */
export function normalizeSuggestion(raw: Record<string, unknown>): SuggestionItem {
  return {
    priority: (raw.priority as SuggestionItem["priority"]) ?? "quick_win",
    text: (raw.text as string) ?? "",
    type: (raw.type as SuggestionItem["type"]) ?? "action_verb",
    originalText:
      (raw.originalText as string | undefined) ??
      (raw.original_text as string | undefined),
    afterText:
      (raw.afterText as string | undefined) ??
      (raw.after_text as string | undefined),
  };
}

/** Bangun initial sections state dari workspace hydration data, merge duplicate section types */
export function buildInitialSections(
  sections: WorkspaceHydration["document"]["sections"],
  draftContent?: Record<string, JSONContent> | null
): SectionState[] {
  // Deduplicate by type — merge text of duplicate sections (NLP may emit multiple blocks per type)
  const merged = new Map<string, string>();
  for (const section of sections) {
    const existing = merged.get(section.type);
    merged.set(section.type, existing ? `${existing}\n${section.text}` : section.text);
  }

  return Array.from(merged.entries()).map(([type, text]) => ({
    type,
    json: draftContent?.[type] ?? plainTextToTiptapDoc(text),
    spacing: "normal" as SpacingValue,
  }));
}
