export type Theme = "light" | "dark";
export const THEME_COOKIE = "pathkr-theme";
export const THEMES: Theme[] = ["light", "dark"];

export function parseTheme(value: string | undefined | null): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}

export function writeThemeCookie(theme: Theme) {
  document.cookie = `${THEME_COOKIE}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
