import type { Editor } from "@tiptap/core";

export function replaceDocumentText(
  editor: Editor | null,
  before: string,
  after: string,
): boolean {
  if (!editor || !before || !after) {
    return false;
  }
  let range: { from: number; to: number } | null = null;
  editor.state.doc.descendants((node, pos) => {
    if (range || !node.isText || !node.text) {
      return;
    }
    const index = node.text.indexOf(before);
    if (index >= 0) {
      range = { from: pos + index, to: pos + index + before.length };
    }
  });
  if (!range) {
    return false;
  }
  editor.commands.insertContentAt(range, after);
  return true;
}

export function insertDocumentText(
  editor: Editor | null,
  text: string,
): boolean {
  if (!editor || !text.trim()) {
    return false;
  }
  editor.commands.insertContentAt(0, {
    type: "paragraph",
    content: [{ type: "text", text }],
  });
  return true;
}

export function appendSkill(editor: Editor | null, skill: string): boolean {
  if (!editor || !skill.trim()) {
    return false;
  }
  const text = editor.getText();
  if (text.toLowerCase().includes(skill.toLowerCase())) {
    return false;
  }
  let foundHeading = false;
  let position: number | null = null;
  editor.state.doc.descendants((node, pos) => {
    if (position !== null) {
      return false;
    }
    if (node.type.name === "heading" && /skills/i.test(node.textContent)) {
      foundHeading = true;
      return false;
    }
    if (foundHeading && node.type.name === "paragraph") {
      position = pos + node.nodeSize - 1;
      return false;
    }
  });
  if (position === null) {
    return false;
  }
  editor.commands.insertContentAt(position, `, ${skill}`);
  return true;
}
