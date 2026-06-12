import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { HealthResponse, ListSessionsResponse } from "@shared/types/api";
import { api } from "../../lib/api";

/** Landing page: a quick overview of the server and active jam sessions. */
export function DashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [sessions, setSessions] = useState<ListSessionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getHealth(), api.listSessions()])
      .then(([healthData, sessionsData]) => {
        setHealth(healthData);
        setSessions(sessionsData);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
      });
  }, []);

  return (
    <section>
      <h1>Dashboard</h1>
      <p className="mt-2 text-muted">
        Welcome to Jam Server — live-code music together with{" "}
        <a href="https://strudel.cc" target="_blank" rel="noreferrer">
          Strudel
        </a>
        .
      </p>

      {error && (
        <p className="error-banner mt-6">Could not reach the server: {error}</p>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article className="card">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted">
            Server Status
          </h2>
          <p className="mt-3 text-2xl font-bold text-secondary">
            {health ? `${health.status} · up ${health.uptimeSeconds}s` : "…"}
          </p>
        </article>

        <article className="card">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted">
            Active Sessions
          </h2>
          <p className="mt-3 text-2xl font-bold text-info">
            {sessions ? sessions.sessions.length : "…"}
          </p>
        </article>

        <article className="card">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted">
            Start Jamming
          </h2>
          <p className="mt-3 text-sm text-muted">
            Open the editor and play your first pattern.
          </p>
          <Link to="/jam" className="btn mt-4">
            Go to Jam Session
          </Link>
        </article>
      </div>
    </section>
  );
}
