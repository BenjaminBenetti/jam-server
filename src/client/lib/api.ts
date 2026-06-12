import type { HealthResponse, ListSessionsResponse } from "@shared/types/api";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

/** Typed client for the Jam Server backend API. */
export const api = {
  getHealth: () => getJson<HealthResponse>("/api/health"),
  listSessions: () => getJson<ListSessionsResponse>("/api/sessions"),
};
