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
  return text
    .split(/\n/)
    .filter(Boolean)
    .map((line, index) => {
      const escaped = highlightLine(line.trim(), fixes);
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
}

function highlightLine(line: string, fixes: WorkspaceFix[]): string {
  const matches = fixes
    .flatMap((fix) => {
      const quote = fix.before.trim();
      if (!quote) {
        return [];
      }
      const pattern = quote
        .split(/\s+/)
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("\\s+");
      const match = new RegExp(pattern, "i").exec(line);
      return match
        ? [{ start: match.index, end: match.index + match[0].length, fix }]
        : [];
    })
    .sort((a, b) => a.start - b.start);
  let html = "";
  let offset = 0;
  for (const { start, end, fix } of matches) {
    if (start < offset) {
      continue;
    }
    html += escapeHtml(line.slice(offset, start));
    html += `<span class="suggestion-highlight" data-fix-id="${escapeHtml(fix.id)}" data-label="${escapeHtml(fix.label)}">${escapeHtml(line.slice(start, end))}</span>`;
    offset = end;
  }
  return html + escapeHtml(line.slice(offset));
}
