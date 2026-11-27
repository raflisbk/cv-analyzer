"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { applyTheme } from "./apply-theme";
import { ThemeContext, type ThemeContextValue } from "./theme-context";
import { parseTheme, writeThemeCookie, type Theme } from "./theme-cookie";

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  useEffect(() => {
    const live = parseTheme(document.documentElement.dataset.theme);
    if (live) {
      setThemeState(live);
    }
  }, []);

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
    writeThemeCookie(next);
    setThemeState(next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
    }),
    [theme, setTheme],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
