import {
  addJam,
  getJam,
  listJams,
  updateJam,
  type JamSession,
} from "../sessions/store";
import type { McpToolDefinition, McpServerInfo } from "./protocol";

/**
 * The jam tools exposed to the AI jam partner. Each jam is a Strudel
 * (strudel.cc) pattern script that shows up in the human's jam list,
 * where they can select and play it.
 */

export const jamServerInfo: McpServerInfo = {
  name: "jam-server",
  version: "0.1.0",
  instructions:
    "You are connected to a live music jam session. Jams are Strudel " +
    "(strudel.cc) pattern scripts. Every jam you add or update appears " +
    "instantly in your human partner's jam list, where they can select " +
    "and play it. Keep jams self-contained and playable. Available sounds " +
    "match strudel.cc defaults: synth waveforms (sine, sawtooth, square, " +
    "triangle), ZZFX (z_*), General MIDI soundfonts (gm_*, e.g. " +
    "gm_acoustic_grand_piano), Dirt-Samples (bd, sd, hh, …), tidal drum " +
    "machines (e.g. RolandTR808/909), piano, EmuSP12, vcsl and mridangam " +
    "sample banks.",
};

function requireString(args: Record<string, unknown>, key: string): string {
  const value = args[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing required string argument "${key}"`);
  }
  return value;
}

function optionalString(
  args: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = args[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new Error(`Argument "${key}" must be a string`);
  }
  return value;
}

export function createJamTools(session: JamSession): McpToolDefinition[] {
  return [
    {
      name: "list_jams",
      description:
        "List all jams in this session (id, name, timestamps — without code). " +
        "Use read_jam to get a jam's Strudel code.",
      inputSchema: { type: "object", properties: {} },
      execute: () => ({
        jams: listJams(session).map(({ id, name, createdAt, updatedAt }) => ({
          id,
          name,
          createdAt,
          updatedAt,
        })),
      }),
    },
    {
      name: "read_jam",
      description: "Read a jam, including its full Strudel code.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "Jam id, e.g. \"jam-1\"" },
        },
        required: ["id"],
      },
      execute: (args) => {
        const id = requireString(args, "id");
        const jam = getJam(session, id);
        if (!jam) throw new Error(`No jam with id "${id}"`);
        return jam;
      },
    },
    {
      name: "add_jam",
      description:
        "Add a new jam to the session. The code must be a complete, playable " +
        'Strudel script, e.g. sound("bd hh sd hh"). It appears in your ' +
        "partner's jam list immediately.",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Short human-readable name" },
          code: { type: "string", description: "The Strudel pattern script" },
        },
        required: ["name", "code"],
      },
      execute: (args) =>
        addJam(session, requireString(args, "name"), requireString(args, "code")),
    },
    {
      name: "update_jam",
      description:
        "Update an existing jam's code and/or name. Your partner sees the " +
        "change in their jam list immediately.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "Jam id, e.g. \"jam-1\"" },
          name: { type: "string", description: "New name (optional)" },
          code: { type: "string", description: "New Strudel script (optional)" },
        },
        required: ["id"],
      },
      execute: (args) => {
        const id = requireString(args, "id");
        const updates = {
          name: optionalString(args, "name"),
          code: optionalString(args, "code"),
        };
        if (updates.name === undefined && updates.code === undefined) {
          throw new Error('Provide "name" and/or "code" to update');
        }
        const jam = updateJam(session, id, updates);
        if (!jam) throw new Error(`No jam with id "${id}"`);
        return jam;
      },
    },
  ];
}
