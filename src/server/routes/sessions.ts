import type { ListSessionsResponse } from "@shared/types/api";

/**
 * Jam session endpoints. Currently a stub — sessions will live in a
 * proper store (and likely sync over WebSockets) as the project grows.
 */
export function listSessions(): Response {
  const body: ListSessionsResponse = { sessions: [] };
  return Response.json(body);
}
