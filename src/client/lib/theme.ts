/**
 * Theme registry and persistence. Each theme corresponds to a
 * `[data-theme="…"]` block in styles/global.css; switching themes just
 * flips the attribute on <html>. The choice is remembered in localStorage.
 */

const STORAGE_KEY = "jam-server:theme";

export const THEMES = [
  { id: "salmon", label: "Salmon", swatch: "var(--color-c64-salmon)" },
  { id: "mint", label: "Mint", swatch: "var(--color-c64-mint)" },
  { id: "sky", label: "Sky", swatch: "var(--color-c64-sky)" },
  { id: "butter", label: "Butter", swatch: "var(--color-c64-butter)" },
  { id: "rose", label: "Rose", swatch: "var(--color-c64-rose)" },
  { id: "lavender", label: "Lavender", swatch: "var(--color-c64-lavender)" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME: ThemeId = "salmon";

export function getStoredTheme(): ThemeId {
  const stored = localStorage.getItem(STORAGE_KEY);
  const match = THEMES.find((theme) => theme.id === stored);
  return match ? match.id : DEFAULT_THEME;
}

/** Switch the active theme and remember the choice. */
export function applyTheme(id: ThemeId): void {
  document.documentElement.dataset.theme = id;
  localStorage.setItem(STORAGE_KEY, id);
}

/** Restore the persisted theme. Call once, before the app renders. */
export function initTheme(): void {
  document.documentElement.dataset.theme = getStoredTheme();
}
