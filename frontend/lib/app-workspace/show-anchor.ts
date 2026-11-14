export function showWorkspaceAnchor(anchorId: string, section?: string): void {
  const anchor = document.querySelector<HTMLElement>(
    `[data-fix-id="${CSS.escape(anchorId)}"]`,
  );
  const headings = [...document.querySelectorAll<HTMLElement>(".tiptap h2")];
  const target =
    anchor ??
    headings.find(
      (item) =>
        item.textContent?.trim().toLowerCase() ===
        section?.trim().toLowerCase(),
    ) ??
    document.querySelector<HTMLElement>(".tiptap");
  target?.scrollIntoView({ behavior: "smooth", block: "center" });
  const editor =
    target?.closest<HTMLElement>("[contenteditable]") ??
    target?.querySelector<HTMLElement>("[contenteditable]");
  editor?.focus();
  if (target && editor && target !== editor) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(target);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    target?.animate(
      [{ backgroundColor: "#f2ff00" }, { backgroundColor: "transparent" }],
      { duration: 1200 },
    );
  }
}
