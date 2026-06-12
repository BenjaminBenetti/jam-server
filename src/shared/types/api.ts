/**
 * Types shared between the backend API and the frontend client.
 * Keep request/response shapes here so both sides stay in sync.
 */

export interface HealthResponse {
  status: "ok";
  uptimeSeconds: number;
}

/** A jam: a named Strudel pattern script, editable by the AI jam partner. */
export interface JamScript {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionSummary {
  /** Truncated — full session ids are secrets that gate MCP access. */
  id: string;
  createdAt: string;
  jamCount: number;
}

export interface ListSessionsResponse {
  sessions: SessionSummary[];
}

export interface CreateSessionResponse {
  sessionId: string;
  /** MCP endpoint for this session, for the AI jam partner to connect to. */
  mcpUrl: string;
}

export interface ListJamsResponse {
  jams: JamScript[];
}
