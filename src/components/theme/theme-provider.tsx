"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Theme, ThemeMode, ThemeStyle } from "@/lib/theme";
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  applyTheme,
} from "@/lib/theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  setStyle: (style: ThemeStyle) => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  // hydratation depuis localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<Theme>;
        const style = (parsed.style as ThemeStyle) ?? DEFAULT_THEME.style;
        const mode = (parsed.mode as ThemeMode) ?? DEFAULT_THEME.mode;
        const next: Theme = { style, mode };
        setThemeState(next);
        applyTheme(next);
        return;
      }
    } catch {
      // ignore
    }

    applyTheme(DEFAULT_THEME);
  }, []);

  // sync DOM + storage à chaque changement
  useEffect(() => {
    if (typeof window === "undefined") return;
    applyTheme(theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    } catch {
      // ignore
    }
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: (next) => setThemeState(next),
      setStyle: (style) =>
        setThemeState((prev) => ({ ...prev, style })),
      setMode: (mode) =>
        setThemeState((prev) => ({ ...prev, mode })),
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
