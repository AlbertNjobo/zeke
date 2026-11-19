import { itemById, supplierById, type ZekeState } from "@/lib/zeke/views";

export interface EmailView {
  id: string;
  restockId: string;
  direction: "in" | "out";
  from: string;
  to: string;
  subject: string;
  preview: string;
  body: string;
  at: string;
  attachment?: string;
  supplierId?: string;
  /** Original inbound id, needed to mark a supplier email as read. */
  sourceId?: string;
  simulated: boolean;
  read: boolean;
  kind: "quote" | "chase";
}

const previewOf = (text: string) => text.replace(/\s+/g, " ").trim().slice(0, 160);

/** Flattens the mail visible to Zeke into a single inbox, newest first. */
export function emailMessages(state: ZekeState): EmailView[] {
  const messages: EmailView[] = [];

  for (const r of state.restocks) {
    const item = itemById(state, r.itemId);
    const itemName = item?.name ?? r.itemId;
    const unit = item?.unit ?? "units";

    r.inbound
      .filter((m) => m.channel === "email")
      .forEach((m) => {
        messages.push({
          id: `in-${r.id}-${m.id}`,
          restockId: r.id,
          direction: "in",
          from: m.from,
          to: state.company.zekeEmail,
          subject: m.subject ?? "(no subject)",
          preview: previewOf(m.text),
          body: m.text,
          at: m.receivedAt,
          attachment: m.attachment,
          supplierId: supplierById(state, m.from)?.id,
          sourceId: m.id,
          simulated: false,
          read: Boolean(m.readAt),
          kind: "quote",
        });
      });

    r.rfqs
      .filter((q) => q.channel === "email")
      .forEach((q, index) => {
        const supplier = supplierById(state, q.supplierId);
        const body = q.message ?? `Zeke asked ${supplier?.name ?? q.supplierId} for a quote on ${r.quantity} ${unit} of ${itemName}, all by ${r.deadline}.`;
        messages.push({
          id: `out-${r.id}-${index}`,
          restockId: r.id,
          direction: "out",
          from: state.company.zekeEmail,
          to: supplier?.email ?? q.supplierId,
          subject: `Quote request · ${itemName} × ${r.quantity}`,
          preview: previewOf(body),
          body,
          at: q.sentAt,
          supplierId: q.supplierId,
          simulated: q.simulated,
          read: true,
          kind: "quote",
        });
      });

    r.chases
      .filter((c) => c.channel === "email")
      .forEach((c, index) => {
        const supplier = supplierById(state, c.supplierId);
        messages.push({
          id: `chase-${r.id}-${index}`,
          restockId: r.id,
          direction: "out",
          from: state.company.zekeEmail,
          to: supplier?.email ?? c.supplierId,
          subject: `Following up · ${itemName}`,
          preview: previewOf(c.note),
          body: c.note,
          at: c.sentAt,
          supplierId: c.supplierId,
          simulated: c.simulated,
          read: true,
          kind: "chase",
        });
      });
  }

  return messages.sort((a, b) => b.at.localeCompare(a.at));
}
