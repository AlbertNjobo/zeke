import { appendAudit } from "./audit";
import { newId } from "./logic";
import type { Channel, ZekeState } from "./types";

export interface NewSupplier {
  name: string;
  contact: string;
  email?: string;
  phone?: string;
  preferredChannel: Channel;
  categories: string;
  itemIds: string[];
  sourceUrl?: string;
  vettingNote: string;
}

/** Add a candidate to the directory as unapproved. No message leaves the building here. */
export function addCandidateSupplier(state: ZekeState, candidate: NewSupplier) {
  const existing = state.suppliers.find((s) => s.name.toLowerCase() === candidate.name.toLowerCase());
  if (existing) {
    return { supplierId: existing.id, name: existing.name, status: "existing" as const, vettingNote: existing.vettingNote };
  }
  const id = newId("new-supplier");
  state.suppliers.push({
    id,
    name: candidate.name,
    initials: candidate.name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join(""),
    contact: candidate.contact,
    email: candidate.email ?? "not provided",
    phone: candidate.phone ?? "not provided",
    preferredChannel: candidate.preferredChannel,
    categories: candidate.categories,
    itemIds: candidate.itemIds,
    approved: false,
    ordersThisYear: 0,
    onTime: "no history",
    repliesIn: "unknown",
    notes: [],
    history: [],
    source: "new",
    sourceUrl: candidate.sourceUrl,
    vettingNote: candidate.vettingNote,
  });
  appendAudit(state, {
    actor: "zeke",
    action: "Added candidate supplier",
    detail: `${candidate.name}${candidate.sourceUrl ? ` from ${candidate.sourceUrl}` : ""}. New supplier, not approved to contact yet. ${candidate.vettingNote}`,
  });
  return { supplierId: id, name: candidate.name, status: "new" as const, vettingNote: candidate.vettingNote };
}
