import { useEffect, useRef, useState } from "react";
import {
  createStrudelEditor,
  type StrudelEditor,
} from "../../lib/strudel";

const DEFAULT_PATTERN = `// a simple starter beat — edit me and hit Play
sound("bd hh sd hh")`;

/** Live-coding page: write a Strudel pattern and play it. */
export function JamSessionPage() {
  const editorRoot = useRef<HTMLDivElement>(null);
  const editorRef = useRef<StrudelEditor | null>(null);
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
    <section>
      <h1>Jam Session</h1>
      <p className="mt-2 text-muted">
        Write a{" "}
        <a href="https://strudel.cc/learn" target="_blank" rel="noreferrer">
          Strudel
        </a>{" "}
        pattern below, then press Play. Playback runs in your browser.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <div
          ref={editorRoot}
          className="min-h-[280px] w-full border-2 border-border bg-screen shadow-chunky"
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
    </section>
  );
}
