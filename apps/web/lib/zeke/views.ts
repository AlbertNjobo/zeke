import { isOpen, itemById, needsBuyer, openQuestions, poTotals, formatMoney } from "@zeke/logic";
import type { Channel, Restock, ZekeState } from "@zeke/types";

export type { Channel, Company, PurchaseOrder, Question, Quote, QuoteSource, Restock, StockItem, Supplier, SupplierEvent, ZekeState } from "@zeke/types";
export { formatMoney, isLow, itemById, needsBuyer, openQuestions, poTotals, supplierById } from "@zeke/logic";

export type ZekeMood =
  | "idle"
  | "thinking"
  | "working"
  | "waiting"
  | "blocked"
  | "done"
  | "alert"
  | "notify"
  | "celebrate"
  | "curious";
export type ThreadStatus = "needs-you" | "working" | "blocked" | "done";

export interface ThreadView {
  id: string;
  title: string;
  status: ThreadStatus;
  face: ZekeMood;
  line: string;
  channels: Channel[];
  at: string;
}

export function threadStatus(r: Restock): ThreadStatus {
  if (r.status === "blocked") return "blocked";
  if (needsBuyer(r)) return "needs-you";
  if (r.status === "sent" || r.status === "skipped") return "done";
  return "working";
}

const FACE: Record<ThreadStatus, ZekeMood> = { "needs-you": "waiting", working: "working", blocked: "blocked", done: "done" };

export function restockLine(state: ZekeState, r: Restock) {
  const item = itemById(state, r.itemId);
  const unit = item?.unit ?? "units";
  const question = openQuestions(r)[0];
  switch (r.status) {
    case "proposed":
      return `Ask ${r.supplierIds.length} suppliers for ${r.quantity} ${unit}? About AED ${formatMoney(r.estimate)}`;
    case "approved":
      return "Approved · asking suppliers now";
    case "collecting":
      if (question) return question.text;
      return `${r.quotes.length} of ${r.supplierIds.length} quotes in`;
    case "po-review":
      return r.po ? `${r.po.number} ready for your review · AED ${formatMoney(poTotals(r.po, state.company.vatRate).total)}` : "PO ready for review";
    case "blocked":
      return "Best quote is over your spend limit";
    case "sent":
      return r.po ? `${r.po.number} sent` : "Sent";
    case "skipped":
      return "Skipped · nothing sent";
  }
}

export function lastActivity(r: Restock) {
  return r.timeline.at(-1)?.at ?? r.createdAt;
}

export function threadView(state: ZekeState, r: Restock): ThreadView {
  const item = itemById(state, r.itemId);
  const status = threadStatus(r);
  return {
    id: r.id,
    title: `Restock · ${item?.name ?? r.itemId}`,
    status,
    face: FACE[status],
    line: restockLine(state, r),
    channels: [...new Set(r.rfqs.map((q) => q.channel))],
    at: lastActivity(r),
  };
}

export function threads(state: ZekeState): ThreadView[] {
  const order: Record<ThreadStatus, number> = { "needs-you": 0, blocked: 1, working: 2, done: 3 };
  return state.restocks
    .map((r) => threadView(state, r))
    .sort((a, b) => order[a.status] - order[b.status] || b.at.localeCompare(a.at));
}

export function isOpenNeedsYou(state: ZekeState) {
  return state.restocks.some((r) => isOpen(r) && needsBuyer(r));
}

const CUE_TTL_MS = 12_000;

function freshCue(state: ZekeState) {
  if (!state.character) return undefined;
  if (Date.now() - new Date(state.character.at).getTime() > CUE_TTL_MS) return undefined;
  return state.character;
}

function baseMood(state: ZekeState): ZekeMood {
  const open = state.restocks.filter(isOpen);
  if (open.some(needsBuyer)) return "waiting";
  if (open.some((r) => r.status === "approved" || r.status === "collecting")) return "working";
  return "idle";
}

/** The face on the rail: a live event reaction if one is fresh, otherwise the page state. */
export function appMood(state: ZekeState): ZekeMood {
  return freshCue(state)?.state ?? baseMood(state);
}

export function characterExpression(state: ZekeState): string {
  return freshCue(state)?.expression ?? "attentif";
}

/** "09:40", "Mon", "12 Nov": short, in the buyer's timezone. */
export function shortTime(iso: string, timeZone = "Asia/Dubai") {
  const date = new Date(iso);
  const day = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const today = day(new Date());
  const diffDays = Math.round((new Date(today).getTime() - new Date(day(date)).getTime()) / 86_400_000);
  if (diffDays === 0) return new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit" }).format(date);
  if (diffDays < 7) return new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "short" }).format(date);
  return new Intl.DateTimeFormat("en-GB", { timeZone, day: "numeric", month: "short" }).format(date);
}

/** "Today 09:40", "Mon 15:10", "12 Nov". */
export function longTime(iso: string, timeZone = "Asia/Dubai") {
  const short = shortTime(iso, timeZone);
  if (/^\d{2}:\d{2}$/.test(short)) return `Today ${short}`;
  if (/^[A-Z][a-z]{2}$/.test(short)) {
    return `${short} ${new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit" }).format(new Date(iso))}`;
  }
  return short;
}
