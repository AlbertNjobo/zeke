import type { PurchaseOrder, QuoteComparison, Restock, StockItem, Supplier, ZekeState } from "./types";

export function poTotals(po: Pick<PurchaseOrder, "quantity" | "unitPrice">, vatRate: number) {
  const subtotal = round2(po.quantity * po.unitPrice);
  const vat = round2(subtotal * vatRate);
  return { subtotal, vat, total: round2(subtotal + vat) };
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function formatMoney(value: number, decimals = 0) {
  return value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function isLow(item: StockItem) {
  return item.onHand < item.reorderPoint;
}

/** Days until the item runs out at its usual daily use. */
export function daysLeft(item: StockItem) {
  return item.dailyUse > 0 ? Math.floor(item.onHand / item.dailyUse) : Infinity;
}

export function itemById(state: ZekeState, id: string) {
  return state.items.find((i) => i.id === id);
}

/** Accepts an exact id/SKU/name or a natural fragment such as "gloves" or "nitrile-gloves". */
export function resolveItem(state: ZekeState, ref: string): StockItem | undefined {
  const q = ref.trim().toLowerCase();
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return (
    state.items.find((i) => i.id.toLowerCase() === q || i.sku.toLowerCase() === q || i.name.toLowerCase() === q) ??
    state.items.find((i) => norm(i.name).includes(norm(q)) || norm(i.id).includes(norm(q)) || norm(i.sku).includes(norm(q)))
  );
}

export function validItemRefs(state: ZekeState) {
  return state.items.map((i) => `${i.id} (${i.name})`).join(", ");
}

export function supplierById(state: ZekeState, id: string) {
  return state.suppliers.find((s) => s.id === id);
}

export function restockById(state: ZekeState, id: string) {
  return state.restocks.find((r) => r.id === id);
}

/** Restocks that still need something from the buyer or from Zeke. */
export function isOpen(r: Restock) {
  return r.status !== "sent" && r.status !== "skipped";
}

export function openQuestions(r: Restock) {
  return r.questions.filter((q) => q.answer === undefined);
}

export function needsBuyer(r: Restock) {
  return r.status === "proposed" || r.status === "po-review" || r.status === "blocked" || openQuestions(r).length > 0;
}

export function suppliersFor(state: ZekeState, itemId: string): Supplier[] {
  return state.suppliers.filter((s) => s.approved && s.itemIds.includes(itemId));
}

/** Known suppliers that carry the item, best fit first. Read-only; no one is contacted. */
export function rankSuppliers(state: ZekeState, itemId: string) {
  return suppliersFor(state, itemId)
    .map((s) => ({
      supplierId: s.id,
      name: s.name,
      channel: s.preferredChannel,
      onTime: s.onTime,
      repliesIn: s.repliesIn,
      ordersThisYear: s.ordersThisYear,
      vettingNote: s.vettingNote ?? `${s.contact} · ${s.categories} · on time ${s.onTime}.`,
    }))
    .sort((a, b) => b.ordersThisYear - a.ordersThisYear || a.repliesIn.localeCompare(b.repliesIn));
}

/**
 * Decide the award from the filed quotes, in code rather than in the prompt.
 * Must-haves and the spend limit are checked on every quote; the result is stored on the restock.
 */
export function compareQuotes(state: ZekeState, r: Restock): QuoteComparison {
  const assessed = r.quotes.map((q) => {
    const reasons: string[] = [];
    const totalInclVat = round2(r.quantity * q.perUnit * (1 + state.company.vatRate));
    if (!Number.isFinite(q.perUnit) || q.perUnit <= 0) reasons.push("No usable unit price.");
    if (q.meetsDeadline !== true) {
      reasons.push(
        q.meetsDeadline === null
          ? `No delivery date confirmed for ${r.deadline}.`
          : `Cannot deliver all ${r.quantity} by ${r.deadline}.`,
      );
    }
    if (!supplierById(state, q.supplierId)?.approved) reasons.push("Supplier is not on the approved list.");
    return { supplierId: q.supplierId, totalInclVat, eligible: reasons.length === 0, reasons };
  });

  const eligible = assessed.filter((a) => a.eligible).sort((a, b) => a.totalInclVat - b.totalInclVat);
  const best = eligible[0];
  const comparison: QuoteComparison = {
    comparedAt: nowIso(),
    quantity: r.quantity,
    deadline: r.deadline,
    limit: state.company.orderLimit,
    assessed,
  };
  if (best) {
    comparison.winner = {
      supplierId: best.supplierId,
      totalInclVat: best.totalInclVat,
      reason: `Cheapest quote that meets every must-have: AED ${formatMoney(best.totalInclVat, 2)} incl. VAT, all ${r.quantity} by ${r.deadline}.`,
    };
    if (best.totalInclVat > state.company.orderLimit) {
      comparison.overLimit = { total: best.totalInclVat, overBy: round2(best.totalInclVat - state.company.orderLimit) };
    }
  }
  return comparison;
}

export function nowIso() {
  return new Date().toISOString();
}

export function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
