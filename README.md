# Jam Server

Strudel jam server - AI tunes - good vibes.

A [Bun](https://bun.sh) fullstack app for live-coding music with
[Strudel](https://strudel.cc): a backend API and a React frontend served from a
single `Bun.serve` process.

## Getting started

```sh
bun install
bun run dev       # dev server with HMR at http://localhost:3000
```

Other scripts:

```sh
bun run start       # production mode
bun run typecheck   # TypeScript type checking
```

## Jamming with an AI partner (MCP)

Opening the Jam Session page creates a fresh in-memory session with a random
MCP url (`/mcp/<session-id>`). Clicking the url copies a ready-to-use
`.mcp.json` to the clipboard; point a coding agent (Claude Code, Cursor, …)
at it and the agent can jam along via four tools:

- `list_jams` / `read_jam` — browse the session's jams
- `add_jam` / `update_jam` — write Strudel scripts into the session

Jams appear live in the page's jam list, where the human selects and plays
them. There is no auth: the unguessable session id is the secret
(capability-url style), sessions live only in server memory, and listings
never expose full ids.

## Project structure

```
src/
├── server/            # Backend (Bun.serve)
│   ├── index.ts       # Entrypoint: serves the API + bundled frontend
│   ├── config.ts      # Environment-driven configuration
│   ├── mcp/           # Minimal MCP server (protocol plumbing + jam tools)
│   ├── sessions/      # In-memory jam session store
│   └── routes/        # API route table + one file per endpoint group
├── client/            # Frontend (React SPA)
│   ├── index.html     # Bundler entry, imported by the server
│   ├── App.tsx        # Router + layout
│   ├── components/    # Shared UI components (Header, …)
│   ├── pages/         # One folder per route (dashboard, jam)
│   ├── lib/           # Client utilities (API client, Strudel wrapper)
│   ├── styles/        # Global CSS
│   └── types/         # Ambient type declarations
└── shared/            # Code shared by server and client (API types)
```

## Styling

Styling uses [Tailwind CSS v4](https://tailwindcss.com) (via
`bun-plugin-tailwind`, registered in `bunfig.toml`). The design system lives in
`src/client/styles/global.css`:

- **Theme**: "pastel Commodore 64" — defined as design tokens in the `@theme`
  block. There are two layers:
  - the raw palette (`--color-c64-*`): the actual colors;
  - semantic tokens (`--color-primary`, `--color-surface`, …): aliases the
    components use. Re-theming the app means remapping these.
- **Selectable themes**: one per pastel primary (salmon is the default), each
  a `[data-theme="…"]` block in `global.css` that remaps the semantic tokens.
  The header's theme picker sets the attribute on `<html>` and persists the
  choice to localStorage. To add a theme: add a CSS block + register it in
  `src/client/lib/theme.ts`.
- Components should use the **semantic** utilities (`bg-surface`,
  `text-primary`, `border-border`, `shadow-chunky`, `font-display`) rather
  than raw palette colors or hex values.
- A few shared component classes (`.btn`, `.card`, `.error-banner`) are
  defined in `@layer components`; everything else is utility classes in JSX.
- Fonts: "Press Start 2P" (display/headings) and "JetBrains Mono" (body),
  loaded from Google Fonts in `index.html`.

## Conventions

- API request/response shapes live in `src/shared/types/` so the server and
  client can't drift apart.
- All Strudel access on the client goes through `src/client/lib/strudel.ts`.
- New API endpoints: add a handler file under `src/server/routes/` and register
  it in `src/server/routes/index.ts`.
- Path aliases `@server/*`, `@client/*`, `@shared/*` are configured in
  `tsconfig.json` and understood by Bun.

## Dev Container

This repository includes a dev container at `.devcontainer/devcontainer.json`
with Bun preinstalled.
