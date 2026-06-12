import type { JamScript, SessionSummary } from "@shared/types/api";

/**
 * In-memory store for jam sessions. Sessions are deliberately not persisted:
 * a session lives as long as the server process, and its random id doubles
 * as the (unauthenticated) MCP access secret — treat it like a capability.
 */

export interface JamSession {
  id: string;
  createdAt: string;
  jams: Map<string, JamScript>;
  /** Monotonic counter for friendly jam ids ("jam-1", "jam-2", …). */
  jamCounter: number;
}

const sessions = new Map<string, JamSession>();

export function createSession(): JamSession {
  const session: JamSession = {
    // 32 hex chars (~122 bits) — the secret part of the MCP url.
    id: crypto.randomUUID().replaceAll("-", ""),
    createdAt: new Date().toISOString(),
    jams: new Map(),
    jamCounter: 0,
  };
  sessions.set(session.id, session);
  return session;
}

export function getSession(id: string): JamSession | undefined {
  return sessions.get(id);
}

/** Summaries only — never expose full session ids in listings. */
export function getSessionSummaries(): SessionSummary[] {
  return [...sessions.values()].map((session) => ({
    id: `${session.id.slice(0, 8)}…`,
    createdAt: session.createdAt,
    jamCount: session.jams.size,
  }));
}

export function listJams(session: JamSession): JamScript[] {
  return [...session.jams.values()];
}

export function getJam(session: JamSession, id: string): JamScript | undefined {
  return session.jams.get(id);
}

export function addJam(
  session: JamSession,
  name: string,
  code: string,
): JamScript {
  session.jamCounter += 1;
  const now = new Date().toISOString();
  const jam: JamScript = {
    id: `jam-${session.jamCounter}`,
    name,
    code,
    createdAt: now,
    updatedAt: now,
  };
  session.jams.set(jam.id, jam);
  return jam;
}

export function updateJam(
  session: JamSession,
  id: string,
  updates: { name?: string; code?: string },
): JamScript | undefined {
  const jam = session.jams.get(id);
  if (!jam) return undefined;
  if (updates.name !== undefined) jam.name = updates.name;
  if (updates.code !== undefined) jam.code = updates.code;
  jam.updatedAt = new Date().toISOString();
  return jam;
}
