import type { Theme } from "./theme-cookie";

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document
    .querySelector('meta[name="color-scheme"]')
    ?.setAttribute("content", theme);
}
