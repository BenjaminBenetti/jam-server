import { useState } from "react";
import {
  THEMES,
  applyTheme,
  getStoredTheme,
  type ThemeId,
} from "../../lib/theme";

/** Dropdown in the header for switching the color theme. */
export function ThemePicker() {
  const [theme, setTheme] = useState<ThemeId>(getStoredTheme);
  const [open, setOpen] = useState(false);

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  function pick(id: ThemeId) {
    applyTheme(id);
    setTheme(id);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select color theme"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="flex cursor-pointer items-center gap-2 border-2 border-border bg-background px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted hover:text-foreground"
      >
        <span
          className="h-3 w-3 border border-border"
          style={{ background: current.swatch }}
        />
        {current.label}
      </button>

      {open && (
        <>
          {/* invisible backdrop: click anywhere outside to close */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul
            role="listbox"
            aria-label="Color themes"
            className="absolute right-0 z-20 mt-2 w-40 border-2 border-border bg-surface shadow-chunky"
          >
            {THEMES.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={t.id === theme}
                  onClick={() => pick(t.id)}
                  className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider ${
                    t.id === theme
                      ? "bg-primary text-primary-foreground"
                      : "text-muted hover:bg-background hover:text-foreground"
                  }`}
                >
                  <span
                    className="h-3 w-3 border border-border"
                    style={{ background: t.swatch }}
                  />
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
