export function showWorkspaceAnchor(anchorId: string): void {
  const target = document.querySelector<HTMLElement>(
    `[data-fix-id="${CSS.escape(anchorId)}"]`,
  );
  target?.scrollIntoView({ behavior: "smooth", block: "center" });
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    target?.animate(
      [{ backgroundColor: "#f2ff00" }, { backgroundColor: "transparent" }],
      { duration: 1200 },
    );
  }
}
