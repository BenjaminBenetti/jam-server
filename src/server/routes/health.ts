import type { HealthResponse } from "@shared/types/api";

const startedAt = Date.now();

export function getHealth(): Response {
  const body: HealthResponse = {
    status: "ok",
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
  };
  return Response.json(body);
}
