import { formatMoney, itemById, openQuestions, poTotals, supplierById } from "./logic";
import type { Restock, ZekeState } from "./types";

/** A compact, model-friendly view of one restock. */
export function summarizeRestock(state: ZekeState, r: Restock) {
  const item = itemById(state, r.itemId);
  return {
    restockId: r.id,
    item: item ? `${item.name} (${item.onHand} ${item.unit} on hand, reorder at ${item.reorderPoint})` : r.itemId,
    quantity: r.quantity,
    deadline: r.deadline,
    mustHaves: r.mustHaves,
    status: r.status,
    suppliersAsked: r.rfqs.map((q) => `${supplierById(state, q.supplierId)?.name} by ${q.channel}`),
    suppliersToAsk: r.supplierIds.map((id) => supplierById(state, id)?.name),
    quotes: r.quotes.map((q) => ({
      supplierId: q.supplierId,
      supplier: supplierById(state, q.supplierId)?.name,
      perUnit: q.perUnit,
      delivery: q.deliveryLabel,
      meetsDeadline: q.meetsDeadline,
    })),
    openQuestions: openQuestions(r).map((q) => q.text),
    answered: r.questions.filter((q) => q.answer).map((q) => `${q.text} → ${q.answer}`),
    po: r.po
      ? {
          number: r.po.number,
          supplier: supplierById(state, r.po.supplierId)?.name,
          totalInclVat: `AED ${formatMoney(poTotals(r.po, state.company.vatRate).total, 2)}`,
          status: r.po.status,
        }
      : undefined,
    block: r.block?.reason,
  };
}
