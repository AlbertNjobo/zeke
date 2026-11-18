import { defineTool } from "eve/tools";
import { z } from "zod";
import { appendAudit } from "../lib/zeke/audit";
import { itemById, nowIso, restockById, supplierById } from "../lib/zeke/logic";
import { rfqMessage } from "../lib/zeke/outbound";
import { updateState } from "../lib/zeke/store";

export default defineTool({
  description:
    "Propose who to ask for quotes, on which channel, with the exact RFQ copy. Known and new suppliers are labelled. The buyer approves this shortlist in the app before send_rfqs will run.",
  inputSchema: z.object({
    restockId: z.string(),
    supplierIds: z.array(z.string()).min(1).describe("Known and candidate supplier ids to contact."),
    note: z.string().optional().describe("One sentence on why this shortlist, for the buyer."),
  }),
  label: { start: ({ supplierIds }) => `Propose a shortlist of ${supplierIds.length}` },
  async execute({ restockId, supplierIds, note }) {
    return updateState((state) => {
      const r = restockById(state, restockId);
      if (!r) throw new Error(`No restock "${restockId}".`);
      if (r.status !== "approved") throw new Error("The buyer must approve the restock before you propose who to ask.");
      const item = itemById(state, r.itemId);
      const entries = supplierIds.map((id) => {
        const supplier = supplierById(state, id);
        if (!supplier) throw new Error(`No supplier "${id}".`);
        return {
          supplierId: id,
          channel: supplier.preferredChannel,
          isNew: supplier.source === "new" || !supplier.approved,
          vettingNote: supplier.vettingNote ?? `${supplier.contact} · on time ${supplier.onTime}.`,
          draftMessage: rfqMessage({
            company: state.company,
            supplier,
            itemName: item?.name ?? r.itemId,
            quantity: r.quantity,
            unit: item?.unit ?? "units",
            deadline: r.deadline,
          }),
        };
      });
      const at = nowIso();
      r.shortlist = { proposedAt: at, entries, status: "proposed" };
      r.timeline.push({ at, text: `Proposed a shortlist of ${entries.length} suppliers` });
      appendAudit(state, {
        actor: "zeke",
        action: "Proposed shortlist",
        detail: `${entries.map((e) => (supplierById(state, e.supplierId)?.name ?? e.supplierId)).join(", ")}. ${note ?? "Awaiting buyer approval before any RFQ."}`,
        restockId,
      });
      return {
        restockId,
        entries: entries.map((e) => ({ supplier: supplierById(state, e.supplierId)?.name, channel: e.channel, isNew: e.isNew, draftMessage: e.draftMessage })),
        next: "Stop and tell the buyer the shortlist is waiting. Do not call send_rfqs until they approve it in the app.",
      };
    });
  },
});
