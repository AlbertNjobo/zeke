import { newId, nowIso } from "./logic";
import type { AuditEvent, ZekeState } from "./types";

type NewEvent = Pick<AuditEvent, "actor" | "action" | "detail"> & Partial<Pick<AuditEvent, "restockId" | "supplierId">>;

/**
 * Append one decision to the audit log. Mutates state inside the caller's updateState callback,
 * so the event is saved atomically with the change it describes. Events are never edited or removed.
 */
export function appendAudit(state: ZekeState, event: NewEvent) {
  if (!Array.isArray(state.auditLog)) state.auditLog = [];
  state.auditLog.unshift({ id: newId("audit"), at: nowIso(), ...event });
}
