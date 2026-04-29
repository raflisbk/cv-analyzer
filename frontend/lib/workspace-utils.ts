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

// ─── Tiptap mark helpers ─────────────────────────────────────────────────────

function boldText(text: string): JSONContent {
  return { type: "text", text, marks: [{ type: "bold" }] };
}

function normalText(text: string): JSONContent {
  return { type: "text", text };
}

function makeParagraph(nodes: JSONContent[]): JSONContent {
  return { type: "paragraph", content: nodes };
}

function makeBulletItem(text: string): JSONContent {
  return {
    type: "listItem",
    content: [makeParagraph([normalText(text)])],
  };
}

// ─── Line-level pattern detectors ───────────────────────────────────────────

/** Lines starting with common bullet markers: •, -, –, *, → etc. */
const BULLET_RE = /^([•·▪▸–\-]|\*{1,2}|→)\s+(.*)/;

/** "Numbered list" patterns: "1. text", "1) text" */
const NUMBERED_RE = /^\d+[.)]\s+(.*)/;

/**
 * "Title | Company [Date]" — job title / org line.
 * Must NOT contain @ (email) or http (URL) to avoid false positives.
 * Pipe must appear in first 70 chars so it's a short role title.
 */
function isPipeTitleLine(line: string): false | { title: string; rest: string } {
  const pipeIdx = line.indexOf(" | ");
  if (pipeIdx < 2 || pipeIdx > 70) {
    return false;
  }
  if (line.includes("@")) {
    return false;
  }
  if (/^https?:\/\//i.test(line)) {
    return false;
  }
  return { title: line.slice(0, pipeIdx), rest: line.slice(pipeIdx + 3) };
}

/**
 * "Bold Key: description" — lines like "Process Automation: Developed..."
 * Key must be 3–55 chars, start with capital, and contain no `:` itself.
 * Description must follow after the colon.
 */
function isKeyColonLine(line: string): false | { key: string; desc: string } {
  const match = line.match(/^([A-Z][^:]{2,54}):\s+(.+)/);
  if (!match) {
    return false;
  }
  const key = match[1];
  // Avoid matching URLs like "https://..." or dates "Jan 2024"
  if (/^https?/i.test(key) || /^\d/.test(key)) {
    return false;
  }
  return { key, desc: match[2] };
}

/**
 * Short sub-section header — short line (< 60 chars), no terminal punctuation,
 * starts with capital. Used for skill categories like "Programming & Frameworks".
 * Only applied when the next line is non-empty (i.e., there's content below).
 */
function isSubHeader(line: string, nextLine: string | undefined): boolean {
  if (line.length < 3 || line.length > 60) {
    return false;
  }
  if (/[.,;]$/.test(line)) {
    return false;
  }           // ends with punctuation → not a header
  if (!/^[A-Z\u00C0-\u024F]/.test(line)) {
    return false;
  } // must start with capital
  if (line.includes("@")) {
    return false;
  }              // email → skip
  if (/^https?:\/\//i.test(line)) {
    return false;
  }     // URL → skip
  if (nextLine !== undefined && nextLine.trim().length === 0) {
    return false;
  } // nothing below
  return true;
}

// ─── Main converter ──────────────────────────────────────────────────────────

/**
 * Convert plain extracted text to Tiptap JSONContent.
 *
 * Detects common CV patterns:
 * - Explicit bullet markers → bulletList node
 * - "Role | Company Date" → bold title + rest
 * - "Key: Long description" → bold key + rest
 * - Short header lines (skill categories, section sub-titles) → bold paragraph
 * - Everything else → regular paragraph
 *
 * Applied only when no draft_content exists (new upload, not edited yet).
 */
export function plainTextToTiptapDoc(text: string): JSONContent {
  const lines = text.split("\n").map((l) => l.trimEnd());
  const content: JSONContent[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();
    i++;

    // ── Empty line → skip ────────────────────────────────────────────────────
    if (!trimmed) {
      continue;
    }

    // ── Explicit bullet marker ───────────────────────────────────────────────
    const bulletMatch = trimmed.match(BULLET_RE);
    const numberedMatch = trimmed.match(NUMBERED_RE);
    if (bulletMatch || numberedMatch) {
      const firstText = bulletMatch ? bulletMatch[2] : numberedMatch![1];
      const items: JSONContent[] = [makeBulletItem(firstText)];

      // Collect consecutive bullet lines
      while (i < lines.length) {
        const next = lines[i].trim();
        if (!next) {
          i++;
          break;
        } // blank line ends the list
        const bm = next.match(BULLET_RE);
        const nm = next.match(NUMBERED_RE);
        if (bm || nm) {
          items.push(makeBulletItem(bm ? bm[2] : nm![1]));
          i++;
        } else {
          break;
        }
      }

      content.push({ type: "bulletList", content: items });
      continue;
    }

    // ── "Role | Company [Date]" ───────────────────────────────────────────────
    const pipeResult = isPipeTitleLine(trimmed);
    if (pipeResult) {
      content.push(makeParagraph([
        boldText(pipeResult.title),
        normalText(" | " + pipeResult.rest),
      ]));
      continue;
    }
    // ── "Key: Description" ───────────────────────────────────────────────────
    const colonResult = isKeyColonLine(trimmed);
    if (colonResult) {
      content.push(makeParagraph([
        boldText(colonResult.key + ": "),
        normalText(colonResult.desc),
      ]));
      continue;
    }

    // ── Short sub-section header ─────────────────────────────────────────────
    const nextTrimmed = lines[i]?.trim();
    if (isSubHeader(trimmed, nextTrimmed)) {
      content.push(makeParagraph([boldText(trimmed)]));
      continue;
    }
    // ── Default: regular paragraph ───────────────────────────────────────────
    content.push(makeParagraph([normalText(trimmed)]));
  }

  // Ensure at least one empty paragraph so Tiptap can place cursor
  if (content.length === 0) {
    content.push(makeParagraph([]));
  }

  return { type: "doc", content };
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
