import type { WorkspaceFix } from "./fixes";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function contentHtml(text: string, fixes: WorkspaceFix[]): string {
  if (!text.trim()) {
    return "<p></p>";
  }
  let html = text
    .split(/\n/)
    .filter(Boolean)
    .map((line, index) => {
      const escaped = escapeHtml(line.trim());
      if (index === 0) {
        return `<h1>${escaped}</h1>`;
      }
      if (
        /^(experience|education|skills|summary|projects|certifications)$/i.test(
          line.trim(),
        )
      ) {
        return `<h2>${escaped}</h2>`;
      }
      return `<p>${escaped}</p>`;
    })
    .join("");
  for (const fix of fixes) {
    if (!fix.before || !html.includes(escapeHtml(fix.before))) {
      continue;
    }
    html = html.replace(
      escapeHtml(fix.before),
      `<span class="suggestion-highlight" data-fix-id="${escapeHtml(fix.id)}" data-label="${escapeHtml(fix.label)}">${escapeHtml(fix.before)}</span>`,
    );
  }
  return html;
}
