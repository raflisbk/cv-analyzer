import type { JSONContent } from "@tiptap/core";

function nodeText(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(nodeText).join("");
}

export function draftText(document: JSONContent): string {
  return (document.content ?? []).map(nodeText).join("\n");
}
