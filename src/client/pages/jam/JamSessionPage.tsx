import { useEffect, useRef, useState } from "react";
import type { CreateSessionResponse, JamScript } from "@shared/types/api";
import { api } from "../../lib/api";
import { createStrudelEditor, type StrudelEditor } from "../../lib/strudel";
import { JamList } from "./JamList";

const DEFAULT_PATTERN = `// a simple starter beat — edit me and hit Play
sound("bd hh sd hh")`;

const JAM_POLL_INTERVAL_MS = 2000;

/** Live-coding page: write Strudel patterns and jam with an AI partner over MCP. */
export function JamSessionPage() {
  const editorRoot = useRef<HTMLDivElement>(null);
  const editorRef = useRef<StrudelEditor | null>(null);
  const [session, setSession] = useState<CreateSessionResponse | null>(null);
  const [jams, setJams] = useState<JamScript[]>([]);
  const [selectedJamId, setSelectedJamId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editorRoot.current) return;
    const editor = createStrudelEditor({
      root: editorRoot.current,
      initialCode: DEFAULT_PATTERN,
      onPlayStateChange: setPlaying,
      onError: setError,
    });
    editorRef.current = editor;
    return () => {
      editorRef.current = null;
      editor.destroy();
    };
  }, []);

  // A fresh session (and MCP url) per page visit; deliberately not persisted.
  useEffect(() => {
    let cancelled = false;
    api
      .createSession()
      .then((created) => {
        if (!cancelled) setSession(created);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Poll for jams so the AI partner's changes show up while we play.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const { jams: latest } = await api.listJams(session.sessionId);
        if (!cancelled) setJams(latest);
      } catch {
        // transient poll failure (e.g. dev-server restart) — try again next tick
      }
    };
    void poll();
    const interval = setInterval(poll, JAM_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [session]);

  function handleCopyMcpConfig() {
    if (!session) return;
    const mcpJson = JSON.stringify(
      {
        mcpServers: {
          "jam-server": { type: "http", url: session.mcpUrl },
        },
      },
      null,
      2,
    );
    void navigator.clipboard.writeText(mcpJson).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleSelectJam(jam: JamScript) {
    setSelectedJamId(jam.id);
    editorRef.current?.setCode(jam.code);
  }

  async function handlePlay() {
    setError(null);
    setLoading(true);
    try {
      await editorRef.current?.evaluate();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function handleStop() {
    editorRef.current?.stop();
  }

  return (
    // 76px = 60px fixed header + 16px gap; both columns end 16px above the
    // window bottom. From 102rem (content + list + gaps fit) the list leaves
    // the flow and floats fixed in the left gutter, hanging off the centered
    // content: left = 50% − 32rem (half of max-w-5xl) − 19rem (w-72 + gap).
    <section className="flex flex-col gap-4 px-4 pb-4 pt-[76px] lg:flex-row">
      <JamList
        jams={jams}
        selectedId={selectedJamId}
        onSelect={handleSelectJam}
        className="order-last max-h-64 shrink-0 lg:sticky lg:top-[76px] lg:order-first lg:max-h-none lg:h-[calc(100vh-92px)] lg:w-72 min-[102rem]:fixed min-[102rem]:bottom-4 min-[102rem]:left-[calc(50%-51rem)] min-[102rem]:h-auto"
      />

      {/* Mirrors the header's container (max-w-5xl px-6), so the title lines
          up with the brand once the list floats out of the flow. */}
      <div className="mx-auto flex w-full min-w-0 max-w-5xl flex-1 flex-col px-6 lg:h-[calc(100vh-92px)]">
        <h1>Jam Session</h1>
        <p className="mt-2 text-muted">
          Connect your jam partner{" "}
          {session ? (
            <button
              type="button"
              onClick={handleCopyMcpConfig}
              title="Click to copy .mcp.json"
              className="cursor-pointer break-all text-info underline decoration-dotted underline-offset-4 hover:decoration-solid"
            >
              {session.mcpUrl}
            </button>
          ) : (
            <span>…</span>
          )}
          {copied && (
            <span className="ml-2 text-xs font-bold uppercase text-secondary">
              ✓ .mcp.json copied
            </span>
          )}
        </p>

        <div className="mt-8 flex min-h-0 flex-1 flex-col gap-4">
          <div
            ref={editorRoot}
            className="min-h-[280px] w-full flex-1 overflow-hidden border-2 border-border bg-screen shadow-chunky"
            aria-label="Strudel pattern editor"
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn"
              onClick={handlePlay}
              disabled={loading}
            >
              {loading ? "Loading…" : "▶ Play"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleStop}
              disabled={!playing}
            >
              ■ Stop
            </button>
            <span
              className={`text-sm uppercase tracking-wider ${
                playing ? "text-secondary" : "text-muted"
              }`}
            >
              {playing ? "playing" : "idle"}
            </span>
            <span className="ml-auto hidden text-xs text-muted sm:block">
              Ctrl+Enter to play · Ctrl+. to stop
            </span>
          </div>

          {error && <p className="error-banner">{error}</p>}
        </div>
      </div>
    </section>
  );
}
