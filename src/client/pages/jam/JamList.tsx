import type { JamScript } from "@shared/types/api";

interface JamListProps {
  jams: JamScript[];
  selectedId: string | null;
  onSelect: (jam: JamScript) => void;
  /** Layout (size/position) classes from the page. */
  className?: string;
}

/** Sidebar listing the jams the AI partner has added to the session. */
export function JamList({
  jams,
  selectedId,
  onSelect,
  className = "",
}: JamListProps) {
  return (
    <aside
      className={`flex flex-col border-2 border-border bg-surface shadow-chunky ${className}`}
    >
      <h2 className="border-b-2 border-border px-3 py-2 text-xs font-bold uppercase tracking-widest text-muted">
        Jams
      </h2>

      {jams.length === 0 ? (
        <p className="p-3 text-xs text-muted">
          No jams yet — ask your AI partner to add one.
        </p>
      ) : (
        <ul className="flex-1 overflow-y-auto">
          {jams.map((jam) => (
            <li key={jam.id}>
              <button
                type="button"
                onClick={() => onSelect(jam)}
                className={`block w-full cursor-pointer border-b border-border px-3 py-2 text-left text-sm ${
                  jam.id === selectedId
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-background"
                }`}
              >
                <span className="block truncate font-bold">{jam.name}</span>
                <span
                  className={`block text-xs ${
                    jam.id === selectedId ? "" : "text-muted"
                  }`}
                >
                  {jam.id} · {new Date(jam.updatedAt).toLocaleTimeString()}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
