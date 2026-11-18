import { defineTool } from "eve/tools";
import { z } from "zod";
import { appendAudit } from "../lib/zeke/audit";
import { itemById, nowIso, restockById, supplierById } from "../lib/zeke/logic";
import { sendFromZeke } from "../lib/zeke/outbound";
import { readState, updateState } from "../lib/zeke/store";

export default defineTool({
  description:
    "Remind suppliers who have not replied to an approved RFQ. Respects the per-supplier chase cap and the WhatsApp window rule; sends are simulated. It never chases a supplier who has already quoted.",
  inputSchema: z.object({
    restockId: z.string(),
    supplierIds: z.array(z.string()).optional().describe("Defaults to every asked supplier who has not quoted."),
    note: z.string().optional().describe("Context for the audit log, e.g. the buyer asked you to chase."),
  }),
  label: { start: () => "Chase unanswered RFQs" },
  async execute({ restockId, supplierIds, note }) {
    const state = await readState();
    const r = restockById(state, restockId);
    if (!r) throw new Error(`No restock "${restockId}".`);
    if (r.rfqs.length === 0) throw new Error("No RFQs have been sent on this restock yet.");
    const item = itemById(state, r.itemId);
    const targets = supplierIds ?? r.rfqs.map((q) => q.supplierId);
    const sent: Array<{ supplierId: string; supplier: string; channel: "email" | "whatsapp" | "phone"; at: string; note: string }> = [];
    const skipped: Array<{ supplierId: string; reason: string }> = [];

    for (const supplierId of targets) {
      const rfq = r.rfqs.find((q) => q.supplierId === supplierId);
      const supplier = supplierById(state, supplierId);
      if (!rfq || !supplier) {
        skipped.push({ supplierId, reason: "Not asked on this restock." });
        continue;
      }
      if (r.quotes.some((q) => q.supplierId === supplierId)) {
        skipped.push({ supplierId, reason: "Already quoted." });
        continue;
      }
      const already = r.chases.filter((c) => c.supplierId === supplierId).length;
      if (already >= state.company.maxChases) {
        skipped.push({ supplierId, reason: `Chase cap of ${state.company.maxChases} reached.` });
        continue;
      }
      if (rfq.channel === "whatsapp" && !r.inbound.some((m) => m.channel === "whatsapp" && m.from === supplier.name)) {
        skipped.push({ supplierId, reason: "WhatsApp window is not open; no approved template on this demo." });
        continue;
      }
      const first = supplier.contact.split(/[ ,]/)[0];
      const message = `Hi ${first}, following up on Zeke's quote request for ${r.quantity} ${item?.unit ?? "units"} of ${item?.name ?? r.itemId}, all by ${r.deadline}. Could you send the price per unit, delivery date and payment terms?`;
      const result = await sendFromZeke(supplier, rfq.channel, message, state.company);
      sent.push({ supplierId, supplier: supplier.name, channel: result.channel, at: nowIso(), note: message });
    }

    if (sent.length > 0) {
      await updateState((s) => {
        const rr = restockById(s, restockId);
        if (!rr) throw new Error("This restock changed while chasing. Check it again.");
        for (const x of sent) {
          const already = rr.chases.filter((c) => c.supplierId === x.supplierId).length;
          if (already >= s.company.maxChases) throw new Error(`${x.supplier} was chased during this turn. Stop to avoid a duplicate.`);
          rr.chases.push({ supplierId: x.supplierId, channel: x.channel, sentAt: x.at, simulated: true, note: x.note });
          supplierById(s, x.supplierId)?.history.unshift({
            channel: x.channel,
            title: `Chase · ${item?.name ?? rr.itemId}`,
            meta: "Simulated reminder on an approved RFQ",
            at: x.at,
          });
        }
        rr.timeline.push({ at: nowIso(), text: `Chased ${sent.length} supplier${sent.length === 1 ? "" : "s"} who had not quoted` });
        appendAudit(s, {
          actor: "zeke",
          action: "Chased suppliers",
          detail: `${sent.map((x) => x.supplier).join(", ")}. ${note ?? "Reminders on approved RFQs, simulated."}`,
          restockId,
        });
      });
    }
    return { restockId, sent, skipped, next: "Wait for replies. Do not chase again until the cap allows it." };
  },
});
