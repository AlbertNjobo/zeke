import type { PurchaseOrder, Restock, StockItem, Supplier, ZekeState } from "./types";

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

export function nowIso() {
  return new Date().toISOString();
}

export function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
