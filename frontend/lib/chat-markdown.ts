import { createElement, type ReactNode } from "react";

const INLINE =
  /\*\*([^*\n]+?)\*\*|==([^=\n]+?)==|`([^`\n]+?)`|\[([^\]\n]+?)\]\(([^)\s]+)\)|\*([^*\s][^*\n]*?)\*/;
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

export function renderChatMarkdown(text: string): ReactNode[] {
  const blocks: ReactNode[] = [];
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  let paragraph: string[] = [];
  let list: { kind: "ul" | "ol"; items: string[] } | null = null;
  const flush = () => {
    const key = `b${blocks.length}`;
    if (paragraph.length) {
      blocks.push(createElement("p", { key }, lineBreaks(paragraph, key)));
    }
    if (list) {
      blocks.push(listNode(list.kind, list.items, key));
    }
    paragraph = [];
    list = null;
  };
  for (const line of lines) {
    const kind = listKind(line);
    const heading = HEADING.exec(line);
    if (!line.trim()) {
      flush();
    } else if (kind) {
      if (list?.kind !== kind) {
        flush();
        list = { kind, items: [] };
      }
      list.items.push(listItem(line, kind));
    } else if (heading) {
      flush();
      paragraph = [`**${heading[1]}**`];
      flush();
    } else {
      if (list) {
        flush();
      }
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}
