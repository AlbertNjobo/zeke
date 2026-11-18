import { defineTool } from "eve/tools";
import { z } from "zod";
import { formatMoney, isOpen, itemById, nowIso, suppliersFor } from "../lib/zeke/logic";
import { updateState } from "../lib/zeke/store";

export default defineTool({
  description:
    "Propose restocking one low item. Creates a proposal the buyer approves or skips in the Zeke app. Contacts nobody. After calling this, stop and tell the buyer what you proposed.",
  inputSchema: z.object({
    itemId: z.string().describe("Item id from check_stock."),
    quantity: z.number().int().positive().optional().describe("Defaults to the item's usual quantity."),
    deadline: z.string().describe('When everything must arrive, in plain words, e.g. "Thursday".'),
    reason: z.string().describe("One sentence: stock level, reorder point, when it runs out."),
  }),
  label: { start: ({ itemId }) => `Propose a restock of ${itemId}` },
  async execute({ itemId, quantity, deadline, reason }, ctx) {
    return updateState((state) => {
      const item = itemById(state, itemId);
      if (!item) throw new Error(`No item "${itemId}". Use an itemId from check_stock.`);
      const existing = state.restocks.find((r) => r.itemId === itemId && isOpen(r));
      if (existing) {
        return { restockId: existing.id, status: existing.status, note: "An open restock already exists for this item. No new proposal made." };
      }
      const qty = quantity ?? item.usualQuantity;
      const suppliers = suppliersFor(state, itemId);
      if (suppliers.length === 0) throw new Error(`No approved supplier carries ${item.name}. Tell the buyer.`);
      const estimate = Math.round(qty * item.lastUnitPrice * (1 + state.company.vatRate));
      const id = `${item.id}-${Date.now().toString(36)}`;
      const at = nowIso();
      state.restocks.unshift({
        id,
        itemId,
        quantity: qty,
        estimate,
        supplierIds: suppliers.map((s) => s.id),
        reason,
        deadline,
        mustHaves: [`All ${qty} delivered by ${deadline}`],
        status: "proposed",
        sessionId: ctx.session.id,
        createdAt: at,
        rfqs: [],
        quotes: [],
        questions: [],
        timeline: [{ at, text: `Zeke proposed ${qty} ${item.unit} of ${item.name}` }],
      });
      state.activity.unshift({ at, text: `Proposed restocking ${item.name}` });
      return {
        restockId: id,
        status: "proposed",
        quantity: qty,
        estimateInclVat: `about AED ${formatMoney(estimate)}`,
        suppliers: suppliers.map((s) => `${s.name} (${s.preferredChannel})`),
        next: "Waiting for the buyer to approve in the Zeke app. Do not contact suppliers yet.",
      };
    });
  },
});
