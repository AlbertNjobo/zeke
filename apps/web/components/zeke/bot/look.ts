"use client";

/** Persisted character appearance, shared by every ZekeFace and the settings panel. */
export interface CharacterLook {
  shape: string;
  color: string;
  expression: string;
}

/** An empty colour means "follow the theme accent". */
export const DEFAULT_LOOK: CharacterLook = { shape: "nuage", color: "", expression: "attentif" };
const KEY = "zeke.character.look";
let look: CharacterLook = { ...DEFAULT_LOOK };
const listeners = new Set<(look: CharacterLook) => void>();

export function getLook(): CharacterLook {
  return look;
}

export function subscribeLook(listener: (look: CharacterLook) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setLook(patch: Partial<CharacterLook>) {
  look = { ...look, ...patch };
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(look));
  for (const listener of listeners) listener(look);
}

export function loadLook() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CharacterLook>;
      look = { ...DEFAULT_LOOK, ...parsed };
      for (const listener of listeners) listener(look);
    }
  } catch {
    // A corrupt preference should never break the character.
  }
}
