import DOMPurify from "dompurify";

const DEFAULT_ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr",
  "ul", "ol", "li",
  "strong", "em", "b", "i", "u", "s",
  "a", "span", "div",
  "blockquote", "code", "pre",
  "table", "thead", "tbody", "tr", "th", "td",
];

const DEFAULT_ALLOWED_ATTR = ["href", "target", "rel", "class", "id"];

export function sanitizeHtml(
  html: string,
  options?: {
    allowedTags?: string[];
    allowedAttr?: string[];
  }
): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: options?.allowedTags ?? DEFAULT_ALLOWED_TAGS,
    ALLOWED_ATTR: options?.allowedAttr ?? DEFAULT_ALLOWED_ATTR,
  });
}

export function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("mailto:")
  ) {
    return url.trim();
  }
  return "";
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char] ?? char);
}
