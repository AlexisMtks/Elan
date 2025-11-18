export type ThemeStyle = "terracotta"; // on pourra ajouter d'autres styles ici
export type ThemeMode = "light" | "dark";

export interface Theme {
  style: ThemeStyle;
  mode: ThemeMode;
}

export const DEFAULT_THEME: Theme = {
  style: "terracotta",
  mode: "light",
};

export const THEME_STORAGE_KEY = "elan:theme";

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  root.dataset.style = theme.style;
  root.dataset.theme = theme.mode;
  root.classList.toggle("dark", theme.mode === "dark");
  root.style.colorScheme = theme.mode === "dark" ? "dark" : "light";
}
