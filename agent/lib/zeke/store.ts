import { existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { databaseEnabled, readWithVersion, resetDatabase, writeIfVersion } from "./db";
import { seedState } from "./seed";
import type { ZekeState } from "./types";

/**
 * Zeke's state store. With DATABASE_URL set (production), one versioned JSON document in Neon is
 * shared by the agent and the web app. Without it, a local JSON file keeps `eve dev` self-contained.
 * The rest of the app only calls readState / updateState / resetState.
 */

function projectRoot() {
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(dir, "agent", "agent.ts"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

function stateFile() {
  return process.env.ZEKE_STATE_FILE ? resolve(process.env.ZEKE_STATE_FILE) : join(projectRoot(), ".zeke", "state.json");
}

async function write(state: ZekeState) {
  const file = stateFile();
  await mkdir(dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, JSON.stringify(state, null, 2));
  await rename(tmp, file);
}

/** Older state is still valid; fill in fields added after it was written. */
function normalize(state: ZekeState): ZekeState {
  if (!Array.isArray(state.auditLog)) state.auditLog = [];
  if (!state.character) state.character = { state: "idle", expression: "attentif", at: new Date().toISOString() };
  if (!state.emailThreads) state.emailThreads = {};
  if (typeof state.company.maxChases !== "number") state.company.maxChases = 1;
  for (const r of state.restocks) {
    if (!Array.isArray(r.chases)) r.chases = [];
    if (!Array.isArray(r.inbound)) r.inbound = [];
    if (!Array.isArray(r.emailReplies)) r.emailReplies = [];
  }
  return state;
}

export async function readState(): Promise<ZekeState> {
  if (databaseEnabled()) return normalize((await readWithVersion()).state);
  try {
    return normalize(JSON.parse(await readFile(stateFile(), "utf8")) as ZekeState);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const fresh = seedState();
    await write(fresh);
    return fresh;
  }
}

/** Read, change and save in one step. Throw inside `change` to abort without saving. */
export async function updateState<T>(change: (state: ZekeState) => T): Promise<T> {
  if (databaseEnabled()) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const { state, version } = await readWithVersion();
      const result = change(state);
      if (await writeIfVersion(normalize(state), version)) return result;
    }
    throw new Error("Zeke's state changed while saving. Try again.");
  }
  const state = await readState();
  const result = change(state);
  await write(state);
  return result;
}

export async function resetState() {
  const fresh = seedState();
  if (databaseEnabled()) await resetDatabase(fresh);
  else await write(fresh);
  return fresh;
}
