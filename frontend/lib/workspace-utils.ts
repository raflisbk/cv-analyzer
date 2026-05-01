
import type { JSONContent } from "@tiptap/core";
import type { WorkspaceHydration } from "@/lib/workspace";
import type { SuggestionItem } from "@/lib/types";

export type SpacingValue = "compact" | "normal" | "spacious";

export interface SectionState {
  type: string;
  json: JSONContent;
  spacing: SpacingValue;
}

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

const BULLET_RE = /^([•·▪▸–\-]|\*{1,2}|→)\s+(.*)/;

const NUMBERED_RE = /^\d+[.)]\s+(.*)/;

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

function isKeyColonLine(line: string): false | { key: string; desc: string } {
  const match = line.match(/^([A-Z][^:]{2,54}):\s+(.+)/);
  if (!match) {
    return false;
  }
  const key = match[1];
  if (/^https?/i.test(key) || /^\d/.test(key)) {
    return false;
  }
  return { key, desc: match[2] };
}

function isSubHeader(line: string, nextLine: string | undefined): boolean {
  if (line.length < 3 || line.length > 60) {
    return false;
  }
  if (/[.,;]$/.test(line)) {
    return false;
  }
  if (!/^[A-Z\u00C0-\u024F]/.test(line)) {
    return false;
  }
  if (line.includes("@")) {
    return false;
  }
  if (/^https?:\/\//i.test(line)) {
    return false;
  }
  if (nextLine !== undefined && nextLine.trim().length === 0) {
    return false;
  }
  return true;
}

export function plainTextToTiptapDoc(text: string): JSONContent {
  const lines = text.split("\n").map((l) => l.trimEnd());
  const content: JSONContent[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();
    i++;
    if (!trimmed) {
      continue;
    }
    const bulletMatch = trimmed.match(BULLET_RE);
    const numberedMatch = trimmed.match(NUMBERED_RE);
    if (bulletMatch || numberedMatch) {
      const firstText = bulletMatch ? bulletMatch[2] : numberedMatch![1];
      const items: JSONContent[] = [makeBulletItem(firstText)];

      while (i < lines.length) {
        const next = lines[i].trim();
        if (!next) {
          i++;
          break;
        }
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
    const pipeResult = isPipeTitleLine(trimmed);
    if (pipeResult) {
      content.push(makeParagraph([
        boldText(pipeResult.title),
        normalText(" | " + pipeResult.rest),
      ]));
      continue;
    }
    const colonResult = isKeyColonLine(trimmed);
    if (colonResult) {
      content.push(makeParagraph([
        boldText(colonResult.key + ": "),
        normalText(colonResult.desc),
      ]));
      continue;
    }
    const nextTrimmed = lines[i]?.trim();
    if (isSubHeader(trimmed, nextTrimmed)) {
      content.push(makeParagraph([boldText(trimmed)]));
      continue;
    }
    content.push(makeParagraph([normalText(trimmed)]));
  }

  if (content.length === 0) {
    content.push(makeParagraph([]));
  }

  return { type: "doc", content };
}

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
