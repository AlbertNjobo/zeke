import { defineTool } from "eve/tools";
import { z } from "zod";
import { appendAudit } from "../lib/zeke/audit";
import { compareQuotes, formatMoney, nowIso, restockById, supplierById } from "../lib/zeke/logic";
import { updateState } from "../lib/zeke/store";

export default defineTool({
  description:
    "Compare every filed quote on a restock in code: check must-haves and the spend limit, then name the cheapest eligible winner. Call this before draft_po; draft_po refuses a supplier that is not this winner.",
  inputSchema: z.object({ restockId: z.string() }),
  label: { start: () => "Compare the quotes" },
  async execute({ restockId }) {
    return updateState((state) => {
      const r = restockById(state, restockId);
      if (!r) throw new Error(`No restock "${restockId}".`);
      if (r.quotes.length === 0) throw new Error("No quotes filed yet. File them with record_quote first.");

      const comparison = compareQuotes(state, r);
      r.recommendation = comparison;
      const winner = comparison.winner;
      const winnerName = winner ? supplierById(state, winner.supplierId)?.name ?? winner.supplierId : undefined;
      r.timeline.push({
        at: comparison.comparedAt,
        text: winner
          ? `Compared ${r.quotes.length} quotes. ${winnerName} is the cheapest that meets every must-have.`
          : `Compared ${r.quotes.length} quotes. None met every must-have.`,
      });
      appendAudit(state, {
        actor: "zeke",
        action: "Compared quotes",
        detail: winner
          ? `${winnerName}: AED ${formatMoney(winner.totalInclVat, 2)} incl. VAT, cheapest eligible of ${r.quotes.length}.`
          : `None of ${r.quotes.length} quotes met every must-have.`,
        restockId,
        supplierId: winner?.supplierId,
      });
      state.activity.unshift({ at: nowIso(), text: `Compared quotes for ${r.itemId}` });

      return {
        restockId,
        winner: winner
          ? {
              supplierId: winner.supplierId,
              supplier: winnerName,
              totalInclVat: `AED ${formatMoney(winner.totalInclVat, 2)}`,
              reason: winner.reason,
            }
          : undefined,
        overLimit: comparison.overLimit
          ? {
              total: `AED ${formatMoney(comparison.overLimit.total, 2)}`,
              overBy: `AED ${formatMoney(comparison.overLimit.overBy, 2)}`,
              next: "Stop. Explain the gap and offer a smaller quantity, asking the owner, or asking more suppliers.",
            }
          : undefined,
        rejected: comparison.assessed
          .filter((a) => !a.eligible)
          .map((a) => ({ supplier: supplierById(state, a.supplierId)?.name ?? a.supplierId, reasons: a.reasons })),
        next: winner
          ? "Call draft_po with the winning supplierId, unless the order is over the limit."
          : "Ask the buyer what to change; do not draft a PO from an ineligible quote.",
      };
    });
  },
});
