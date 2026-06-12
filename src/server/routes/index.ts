import type { BunRequest } from "bun";
import { getHealth } from "./health";
import { mcpRoute } from "./mcp";
import {
  createSessionRoute,
  listSessionJamsRoute,
  listSessionsRoute,
} from "./sessions";

/**
 * API route table consumed by Bun.serve. Each entry maps a path to its
 * handler(s); add new endpoints here and implement them in a sibling file.
 */
export const apiRoutes = {
  "/api/health": { GET: () => getHealth() },
  "/api/sessions": {
    GET: () => listSessionsRoute(),
    POST: (req: Request) => createSessionRoute(req),
  },
  "/api/sessions/:id/jams": {
    GET: (req: BunRequest<"/api/sessions/:id/jams">) =>
      listSessionJamsRoute(req),
  },
  "/mcp/:sessionId": (req: BunRequest<"/mcp/:sessionId">) => mcpRoute(req),
};
