import type { BunRequest } from "bun";
import type {
  CreateSessionResponse,
  ListJamsResponse,
  ListSessionsResponse,
} from "@shared/types/api";
import {
  createSession,
  getSession,
  getSessionSummaries,
  listJams,
} from "../sessions/store";

/** Create a fresh jam session; called when the Jam Session page opens. */
export function createSessionRoute(req: Request): Response {
  const session = createSession();
  const origin = new URL(req.url).origin;
  const body: CreateSessionResponse = {
    sessionId: session.id,
    mcpUrl: `${origin}/mcp/${session.id}`,
  };
  return Response.json(body);
}

export function listSessionsRoute(): Response {
  const body: ListSessionsResponse = { sessions: getSessionSummaries() };
  return Response.json(body);
}

/** The frontend polls this to see jams the AI partner added or changed. */
export function listSessionJamsRoute(
  req: BunRequest<"/api/sessions/:id/jams">,
): Response {
  const session = getSession(req.params.id);
  if (!session) {
    return Response.json({ error: "Unknown session" }, { status: 404 });
  }
  const body: ListJamsResponse = { jams: listJams(session) };
  return Response.json(body);
}
