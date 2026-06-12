/**
 * Server configuration, resolved from the environment with sensible
 * defaults for local development.
 */
export const serverConfig = {
  port: Number(process.env.PORT ?? 3000),
  development: process.env.NODE_ENV !== "production",
} as const;
