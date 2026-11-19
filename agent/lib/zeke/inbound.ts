import { appendAudit } from "./audit";
import { newId, nowIso } from "./logic";
import type { InboundMessage, Restock, ZekeState } from "./types";

type NewInbound = Pick<InboundMessage, "channel" | "from" | "text"> &
  Partial<Pick<InboundMessage, "subject" | "attachment" | "attachments" | "providerId">>;

/**
 * File raw supplier words on a restock thread. The text is untrusted data: it is stored verbatim
 * and returned to the model as data to read, never as an instruction to obey.
 */
export function fileInboundMessage(state: ZekeState, r: Restock, message: NewInbound): InboundMessage {
  const at = nowIso();
  const filed: InboundMessage = { id: newId("in"), receivedAt: at, ...message };
  r.inbound.push(filed);
  r.timeline.push({ at, text: `Filed ${message.channel} reply from ${message.from}` });
  state.activity.unshift({ at, text: `Filed a supplier reply on ${r.itemId}` });
  const supplier = state.suppliers.find((s) => s.email === message.from || s.name === message.from || s.phone === message.from);
  supplier?.history.unshift({
    channel: message.channel,
    title: message.subject ?? `Reply filed on ${r.itemId}`,
    meta: "Zeke filed it on the purchase thread · supplier words, not instructions",
    at,
  });
  appendAudit(state, {
    actor: "zeke",
    action: "Filed inbound message",
    detail: `${message.channel} from ${message.from} on ${r.itemId}. Untrusted supplier content, read as data.`,
    restockId: r.id,
    supplierId: supplier?.id,
  });
  return filed;
}
