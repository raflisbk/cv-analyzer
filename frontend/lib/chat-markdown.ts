import { createElement, type ReactNode } from "react";

const INLINE_PATTERNS = [
  "\\*\\*([^*\\n]+?)\\*\\*",
  "==([^=\\n]+?)==",
  "`([^`\\n]+?)`",
  "\\[([^\\]\\n]+?)\\]\\(([^)\\s]+)\\)",
  "\\*([^*\\s][^*\\n]*?)\\*",
];
const INLINE = new RegExp(INLINE_PATTERNS.join("|"));
const SAFE_URL = /^(https?:\/\/|mailto:)/i;
const BULLET = /^\s*[-*•]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const HEADING = /^#{1,6}\s+(.*)$/;

function parseInline(text: string, keyBase: string, depth = 0): ReactNode[] {
  const nodes: ReactNode[] = [];
  let rest = text;
  let index = 0;
  while (rest) {
    const match = INLINE.exec(rest);
    if (!match) {
      nodes.push(rest);
      break;
    }
    if (match.index > 0) {
      nodes.push(rest.slice(0, match.index));
    }
    const key = `${keyBase}-${index++}`;
    nodes.push(inlineNode(match, key, depth));
    rest = rest.slice(match.index + match[0].length);
  }
  return nodes;
}

function inlineNode(match: RegExpExecArray, key: string, depth: number) {
  const [whole, bold, mark, code, label, href, italic] = match;
  const inner = (value: string) =>
    depth < 2 ? parseInline(value, key, depth + 1) : value;
  if (bold !== undefined) {
    return createElement("strong", { key }, inner(bold));
  }
  if (mark !== undefined) {
    return createElement("mark", { key }, inner(mark));
  }
  if (code !== undefined) {
    return createElement("code", { key }, code);
  }
  if (label !== undefined) {
    return SAFE_URL.test(href)
      ? createElement(
          "a",
          { key, href, target: "_blank", rel: "noopener noreferrer" },
          inner(label),
        )
      : whole;
  }
  return createElement("em", { key }, inner(italic));
}

function lineBreaks(lines: string[], key: string): ReactNode[] {
  return lines.flatMap((line, index) => [
    ...(index ? [createElement("br", { key: `${key}-br-${index}` })] : []),
    ...parseInline(line, `${key}-${index}`),
  ]);
}

function listNode(kind: "ul" | "ol", items: string[], key: string) {
  return createElement(
    kind,
    { key },
    items.map((item, index) =>
      createElement(
        "li",
        { key: `${key}-${index}` },
        parseInline(item, `${key}-${index}`),
      ),
    ),
  );
}

function listKind(line: string): "ul" | "ol" | null {
  if (BULLET.test(line)) {
    return "ul";
  }
  return NUMBERED.test(line) ? "ol" : null;
}

function listItem(line: string, kind: "ul" | "ol"): string {
  return (kind === "ul" ? BULLET : NUMBERED).exec(line)?.[1] ?? line;
}

interface Pending {
  paragraph: string[];
  list: { kind: "ul" | "ol"; items: string[] } | null;
}

function flush(blocks: ReactNode[], pending: Pending) {
  const key = `b${blocks.length}`;
  if (pending.paragraph.length) {
    blocks.push(
      createElement("p", { key }, lineBreaks(pending.paragraph, key)),
    );
  }
  if (pending.list) {
    blocks.push(listNode(pending.list.kind, pending.list.items, key));
  }
  pending.paragraph = [];
  pending.list = null;
}

function addListItem(blocks: ReactNode[], pending: Pending, line: string) {
  const kind = listKind(line);
  if (!kind) {
    return false;
  }
  if (pending.list?.kind !== kind) {
    flush(blocks, pending);
    pending.list = { kind, items: [] };
  }
  pending.list?.items.push(listItem(line, kind));
  return true;
}

export function renderChatMarkdown(text: string): ReactNode[] {
  const blocks: ReactNode[] = [];
  const pending: Pending = { paragraph: [], list: null };
  for (const line of text.replace(/\r\n?/g, "\n").split("\n")) {
    const heading = HEADING.exec(line);
    if (!line.trim()) {
      flush(blocks, pending);
    } else if (addListItem(blocks, pending, line)) {
      continue;
    } else if (heading) {
      flush(blocks, pending);
      pending.paragraph = [`**${heading[1]}**`];
      flush(blocks, pending);
    } else {
      if (pending.list) {
        flush(blocks, pending);
      }
      pending.paragraph.push(line);
    }
  }
  flush(blocks, pending);
  return blocks;
}
