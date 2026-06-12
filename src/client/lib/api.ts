import type {
  CreateSessionResponse,
  HealthResponse,
  ListJamsResponse,
  ListSessionsResponse,
} from "@shared/types/api";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  if (!response.ok) {
    throw new Error(
      `${init?.method ?? "GET"} ${path} failed with status ${response.status}`,
    );
  }
  return response.json() as Promise<T>;
}

/** Typed client for the Jam Server backend API. */
export const api = {
  getHealth: () => requestJson<HealthResponse>("/api/health"),
  listSessions: () => requestJson<ListSessionsResponse>("/api/sessions"),
  createSession: () =>
    requestJson<CreateSessionResponse>("/api/sessions", { method: "POST" }),
  listJams: (sessionId: string) =>
    requestJson<ListJamsResponse>(`/api/sessions/${sessionId}/jams`),
};
