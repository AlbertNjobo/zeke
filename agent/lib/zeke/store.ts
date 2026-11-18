import { existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { seedState } from "./seed";
import type { ZekeState } from "./types";

/**
 * Zeke's state as one JSON file, shared by the eve agent and the web app on the same machine.
 *
 * Local and demo only: serverless hosts don't share a disk between instances. Before deploying,
 * replace readState/updateState with a database (Supabase is the plan); nothing else changes.
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

export async function readState(): Promise<ZekeState> {
  try {
    return JSON.parse(await readFile(stateFile(), "utf8")) as ZekeState;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const fresh = seedState();
    await write(fresh);
    return fresh;
  }
}

/** Read, change and save in one step. Throw inside `change` to abort without saving. */
export async function updateState<T>(change: (state: ZekeState) => T): Promise<T> {
  const state = await readState();
  const result = change(state);
  await write(state);
  return result;
}

export async function resetState() {
  const fresh = seedState();
  await write(fresh);
  return fresh;
}
