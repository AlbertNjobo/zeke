import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { seedState } from "./seed";
import type { ZekeState } from "./types";

type Sql = NeonQueryFunction<false, false>;

let client: Sql | undefined;

/** Lazy so builds without DATABASE_URL still work. The Neon HTTP driver is safe on serverless. */
function sql(): Sql {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  client ??= neon(url, { fullResults: false });
  return client;
}

export function databaseEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

async function ensureRow() {
  const db = sql();
  await db`CREATE TABLE IF NOT EXISTS zeke_state (id text PRIMARY KEY, data jsonb NOT NULL, version bigint NOT NULL DEFAULT 0)`;
}

function parse(data: unknown): ZekeState {
  return (typeof data === "string" ? JSON.parse(data) : data) as ZekeState;
}

/** One JSON document with an optimistic version, shared by the agent and the web app. */
export async function readWithVersion(): Promise<{ state: ZekeState; version: number }> {
  const db = sql();
  await ensureRow();
  const rows = await db`SELECT data, version FROM zeke_state WHERE id = 'main'`;
  if (rows.length > 0) return { state: parse(rows[0].data), version: Number(rows[0].version) };

  await db`INSERT INTO zeke_state (id, data, version) VALUES ('main', ${JSON.stringify(seedState())}::jsonb, 0) ON CONFLICT (id) DO NOTHING`;
  const fresh = await db`SELECT data, version FROM zeke_state WHERE id = 'main'`;
  return { state: parse(fresh[0].data), version: Number(fresh[0].version) };
}

/** Returns false when another writer changed the row first, so the caller can retry. */
export async function writeIfVersion(state: ZekeState, version: number): Promise<boolean> {
  const db = sql();
  const rows = await db`UPDATE zeke_state SET data = ${JSON.stringify(state)}::jsonb, version = version + 1 WHERE id = 'main' AND version = ${version} RETURNING version`;
  return rows.length > 0;
}

export async function resetDatabase(state: ZekeState) {
  const db = sql();
  await ensureRow();
  await db`UPDATE zeke_state SET data = ${JSON.stringify(state)}, version = version + 1 WHERE id = 'main'`;
}
