import type { BunRequest } from "bun";
import { handleMcpPost } from "../mcp/protocol";
import { createJamTools, jamServerInfo } from "../mcp/tools";
import { getSession } from "../sessions/store";

/**
 * MCP endpoint for AI jam partners. Unauthenticated by design: the random
 * session id in the URL is the access secret, so respond 404 (not 401)
 * to wrong ids and never log or list full ids.
 */
export async function mcpRoute(
  req: BunRequest<"/mcp/:sessionId">,
): Promise<Response> {
  const session = getSession(req.params.sessionId);
  if (!session) {
    return Response.json({ error: "Unknown session" }, { status: 404 });
  }
  if (req.method !== "POST") {
    // No SSE stream / session termination support.
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  }
  return handleMcpPost(req, createJamTools(session), jamServerInfo);
}
