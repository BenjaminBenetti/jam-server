import { NavLink } from "react-router-dom";
import { ThemePicker } from "./ThemePicker";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/jam", label: "Jam Session" },
] as const;

/** Fixed top navigation bar, present on every page. */
export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b-2 border-border bg-surface">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-8 px-6">
        <span className="font-display text-sm text-primary [text-shadow:2px_2px_0_var(--color-accent)]">
          Jam Server
        </span>
        <nav className="flex gap-2">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `px-3 py-1.5 text-sm font-bold uppercase tracking-wider no-underline transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-chunky-sm"
                    : "text-muted hover:bg-background hover:text-foreground"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto">
          <ThemePicker />
        </div>
      </div>
      {/* C64 logo rainbow stripe */}
      <div className="h-1 bg-[linear-gradient(90deg,var(--color-c64-cherry),var(--color-c64-salmon),var(--color-c64-butter),var(--color-c64-mint),var(--color-c64-sky))]" />
    </header>
  );
}
