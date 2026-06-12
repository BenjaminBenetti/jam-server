/**
 * Types shared between the backend API and the frontend client.
 * Keep request/response shapes here so both sides stay in sync.
 */

export interface HealthResponse {
  status: "ok";
  uptimeSeconds: number;
}

export interface JamSessionSummary {
  id: string;
  name: string;
  createdAt: string;
  participantCount: number;
}

export interface ListSessionsResponse {
  sessions: JamSessionSummary[];
}
