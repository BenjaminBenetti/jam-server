import index from "../client/index.html";
import { serverConfig } from "./config";
import { apiRoutes } from "./routes";

/**
 * Jam Server entrypoint.
 *
 * Bun.serve runs the whole app: API routes are handled on the backend,
 * and the imported index.html is bundled (React, TypeScript, CSS) and
 * served for every non-API path so client-side routing works.
 */
const server = Bun.serve({
  port: serverConfig.port,
  development: serverConfig.development && {
    hmr: true,
    console: true,
  },
  routes: {
    ...apiRoutes,
    // SPA fallback: let the client router handle everything else.
    "/*": index,
  },
});

console.log(`🎛️  Jam Server running at ${server.url}`);
