export type Theme = "light" | "dark" | "system";
export const THEME_KEY = "theme";

const isSystemDark = () =>
  typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

export function applyDarkClass(shouldBeDark: boolean) {
  const el = document.documentElement;
  if (shouldBeDark) el.classList.add("dark");
  else el.classList.remove("dark");
}

export function setTheme(theme: Theme) {
  try {
    if (theme === "system") {
      applyDarkClass(isSystemDark());
    } else {
      applyDarkClass(theme === "dark");
    }
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    /* ignore */
  }
}

export function getStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (!v) return null;
    if (v === "light" || v === "dark" || v === "system") return v;
    return null;
  } catch (e) {
    return null;
  }
}

export function toggleTheme() {
  try {
    const current = getStoredTheme() ?? "system";
    // If system, derive current effective and switch to opposite explicit
    let next: Theme;
    if (current === "system") {
      next = isSystemDark() ? "light" : "dark";
    } else {
      next = current === "dark" ? "light" : "dark";
    }
    setTheme(next);
    return next;
  } catch (e) {
    return "light" as Theme;
  }
}

export function initTheme() {
  // Try to apply stored theme, otherwise apply system
  const stored = getStoredTheme();
  setTheme(stored ?? "system");
}
