import { readState } from "@zeke/store";

/** Zeke's current state for a server component. Read fresh on every request. Server code only. */
export async function getState() {
  return readState();
}
