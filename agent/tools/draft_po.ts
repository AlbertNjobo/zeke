import { defineTool } from "eve/tools";
import { z } from "zod";
import { appendAudit } from "../lib/zeke/audit";
import { formatMoney, itemById, nowIso, poTotals, restockById, round2, supplierById } from "../lib/zeke/logic";
import { updateState } from "../lib/zeke/store";

export default defineTool({
  description:
    "Draft the purchase order for a restock from one supplier's filed quote. Enforces the spend limit: over it, the restock is marked blocked and no PO is drafted. Sends nothing; the buyer reviews the PO in the app.",
  inputSchema: z.object({
    restockId: z.string(),
    supplierId: z.string().describe("The supplier whose quote wins: cheapest that meets every must-have."),
    why: z.string().describe("One sentence on why this supplier, for the buyer."),
  }),
  label: { start: ({ supplierId }) => `Draft the PO for ${supplierId}` },
  async execute({ restockId, supplierId, why }) {
    return updateState((state) => {
      const r = restockById(state, restockId);
      if (!r) throw new Error(`No restock "${restockId}".`);
      const quote = r.quotes.find((q) => q.supplierId === supplierId);
      if (!quote) throw new Error(`No filed quote from "${supplierId}" on this restock. File it with record_quote first.`);
      const winner = r.recommendation?.winner;
      if (!winner) throw new Error("Call compare_quotes before drafting a PO. The winner is decided in code, not in the conversation.");
      if (winner.supplierId !== supplierId) {
        throw new Error(`compare_quotes picked ${supplierById(state, winner.supplierId)?.name ?? winner.supplierId}. Do not draft a PO for a different supplier; ask the buyer with ask_buyer first.`);
      }
      const supplier = supplierById(state, supplierId);
      const item = itemById(state, r.itemId);
      const { total } = poTotals({ quantity: r.quantity, unitPrice: quote.perUnit }, state.company.vatRate);
      const at = nowIso();
      const limit = state.company.orderLimit;

      if (total > limit) {
        r.status = "blocked";
        r.block = {
          reason: `The best quote for ${r.quantity} ${item?.unit ?? "units"} is AED ${formatMoney(total)} incl. VAT, over the AED ${formatMoney(limit)} limit for one order.`,
          total,
          supplierId,
          perUnitInclVat: round2(quote.perUnit * (1 + state.company.vatRate)),
        };
        r.timeline.push({ at, text: "Stopped: best quote is over the spend limit" });
        appendAudit(state, {
          actor: "zeke",
          action: "Blocked over limit",
          detail: r.block.reason,
          restockId,
          supplierId,
        });
        const affordable = Math.floor(limit / (quote.perUnit * (1 + state.company.vatRate)));
        return {
          blocked: true,
          totalInclVat: total,
          limit,
          overBy: round2(total - limit),
          largestQuantityUnderLimit: affordable,
          next: "Stop. Explain the gap and offer: cut the quantity, ask the owner to allow this order, or ask more suppliers.",
        };
      }

      const number = `PO-${String(state.poCounter++).padStart(4, "0")}`;
      const checks = [
        `Under your AED ${formatMoney(limit)} limit for one order`,
        `Price matches ${supplier?.name ?? "the supplier"}'s quote`,
        ...(quote.meetsDeadline ? [`Meets your must-have: delivered by ${r.deadline}`] : []),
        ...(supplier?.approved ? [`${supplier.name} is on your approved list`] : []),
      ];
      r.po = {
        number,
        supplierId,
        description: item?.name ?? r.itemId,
        quantity: r.quantity,
        unitPrice: quote.perUnit,
        deliverBy: quote.deliveryLabel,
        payment: quote.paymentTerms ?? "As quoted",
        checks,
        status: "draft",
        draftedAt: at,
      };
      r.status = "po-review";
      r.block = undefined;
      r.timeline.push({ at, text: `Drafted ${number} for ${supplier?.name}. ${why}` });
      state.activity.unshift({ at, text: `Drafted ${number}` });
      appendAudit(state, {
        actor: "zeke",
        action: `Drafted ${number}`,
        detail: `${supplier?.name ?? supplierId}, ${r.quantity} at AED ${formatMoney(quote.perUnit, 2)} per unit, AED ${formatMoney(total, 2)} incl. VAT. ${why}`,
        restockId,
        supplierId,
      });
      return {
        poNumber: number,
        supplier: supplier?.name,
        totalInclVat: `AED ${formatMoney(total, 2)}`,
        meetsDeadline: quote.meetsDeadline,
        next: "Tell the buyer the PO is ready to review in the app. Nothing is sent until they approve.",
      };
    });
  },
});
