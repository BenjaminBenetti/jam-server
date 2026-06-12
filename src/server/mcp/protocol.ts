/**
 * Minimal MCP (Model Context Protocol) server over streamable HTTP.
 *
 * MCP is JSON-RPC 2.0 POSTed to a single endpoint. This implements the
 * stateless subset needed for a tools-only server: initialize, ping,
 * tools/list and tools/call. No sessions header, no SSE stream — every
 * request gets a plain application/json response, which the standard
 * clients (Claude Code, Cursor, …) support.
 */

export interface McpToolDefinition {
  name: string;
  description: string;
  /** JSON Schema for the tool arguments. */
  inputSchema: Record<string, unknown>;
  /**
   * Run the tool. The return value is serialized as the text result;
   * throw an Error to report a tool failure to the model.
   */
  execute: (args: Record<string, unknown>) => unknown;
}

export interface McpServerInfo {
  name: string;
  version: string;
  /** Usage hints surfaced to the connecting agent. */
  instructions?: string;
}

interface JsonRpcMessage {
  jsonrpc?: string;
  id?: number | string | null;
  method?: string;
  params?: Record<string, unknown>;
}

const SUPPORTED_PROTOCOL_VERSIONS = [
  "2025-06-18",
  "2025-03-26",
  "2024-11-05",
];
const DEFAULT_PROTOCOL_VERSION = "2025-03-26";

function resultMessage(id: JsonRpcMessage["id"], result: unknown) {
  return { jsonrpc: "2.0", id: id ?? null, result };
}

function errorMessage(id: JsonRpcMessage["id"], code: number, message: string) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

/** Handle one POSTed JSON-RPC payload (single message or batch). */
export async function handleMcpPost(
  request: Request,
  tools: McpToolDefinition[],
  serverInfo: McpServerInfo,
): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(errorMessage(null, -32700, "Parse error"), {
      status: 400,
    });
  }

  const messages = (Array.isArray(body) ? body : [body]) as JsonRpcMessage[];
  // Notifications and client responses don't get a reply.
  const requests = messages.filter(
    (message) => message.method !== undefined && message.id !== undefined,
  );
  if (requests.length === 0) {
    return new Response(null, { status: 202 });
  }

  const replies = requests.map((message) =>
    handleRequest(message, tools, serverInfo),
  );
  return Response.json(Array.isArray(body) ? replies : replies[0]);
}

function handleRequest(
  message: JsonRpcMessage,
  tools: McpToolDefinition[],
  serverInfo: McpServerInfo,
) {
  const { id, method, params = {} } = message;
  switch (method) {
    case "initialize": {
      const requested = params.protocolVersion;
      const protocolVersion =
        typeof requested === "string" &&
        SUPPORTED_PROTOCOL_VERSIONS.includes(requested)
          ? requested
          : DEFAULT_PROTOCOL_VERSION;
      return resultMessage(id, {
        protocolVersion,
        capabilities: { tools: {} },
        serverInfo: { name: serverInfo.name, version: serverInfo.version },
        ...(serverInfo.instructions
          ? { instructions: serverInfo.instructions }
          : {}),
      });
    }

    case "ping":
      return resultMessage(id, {});

    case "tools/list":
      return resultMessage(id, {
        tools: tools.map(({ name, description, inputSchema }) => ({
          name,
          description,
          inputSchema,
        })),
      });

    case "tools/call":
      return handleToolCall(id, params, tools);

    default:
      return errorMessage(id, -32601, `Method not found: ${method}`);
  }
}

function handleToolCall(
  id: JsonRpcMessage["id"],
  params: Record<string, unknown>,
  tools: McpToolDefinition[],
) {
  const tool = tools.find((candidate) => candidate.name === params.name);
  if (!tool) {
    return errorMessage(id, -32602, `Unknown tool: ${String(params.name)}`);
  }
  const args = (params.arguments ?? {}) as Record<string, unknown>;
  try {
    const value = tool.execute(args);
    const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
    return resultMessage(id, { content: [{ type: "text", text }] });
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    return resultMessage(id, {
      content: [{ type: "text", text }],
      isError: true,
    });
  }
}
