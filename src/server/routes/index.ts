import { getHealth } from "./health";
import { listSessions } from "./sessions";

/**
 * API route table consumed by Bun.serve. Each entry maps a path to its
 * handler(s); add new endpoints here and implement them in a sibling file.
 */
export const apiRoutes = {
  "/api/health": { GET: () => getHealth() },
  "/api/sessions": { GET: () => listSessions() },
};
