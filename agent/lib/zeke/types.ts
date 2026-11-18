/**
 * Zeke's domain, shared by the agent's tools and the web app.
 * Times are ISO strings; the web app formats them in the buyer's timezone.
 */

export type Channel = "email" | "whatsapp" | "phone";

export interface Company {
  name: string;
  timezone: string;
  currency: string;
  vatRate: number;
  /** No single purchase order may exceed this, VAT included. */
  orderLimit: number;
  zekeEmail: string;
  zekeWhatsapp: string;
  deliveryAddress: string;
}

export interface StockItem {
  id: string;
  name: string;
  sku: string;
  unit: string;
  onHand: number;
  reorderPoint: number;
  /** Bar scale for stock views. */
  capacity: number;
  dailyUse: number;
  /** What Zeke asks for by default. */
  usualQuantity: number;
  /** Last price paid per unit, before VAT, for rough estimates. */
  lastUnitPrice: number;
}

export interface SupplierEvent {
  channel: Channel | "po";
  title: string;
  meta: string;
  at: string;
}

export interface Supplier {
  id: string;
  name: string;
  initials: string;
  contact: string;
  email: string;
  phone: string;
  /** The channel this supplier actually answers. */
  preferredChannel: Channel;
  categories: string;
  itemIds: string[];
  approved: boolean;
  ordersThisYear: number;
  onTime: string;
  repliesIn: string;
  notes: string[];
  history: SupplierEvent[];
}

export type QuoteSource =
  | {
      kind: "email";
      from: string;
      subject: string;
      body: string;
      attachment?: string;
      fields: { label: string; value: string; used: boolean }[];
    }
  | { kind: "phone"; recording: string; lines: { at: string; who: string; text: string; used: boolean }[]; note: string }
  | { kind: "whatsapp"; messages: { from: "zeke" | "supplier"; text: string; at: string }[]; flag?: string };

export interface Quote {
  supplierId: string;
  channel: Channel;
  perUnit: number;
  /** Plain words, e.g. "Thursday", "Next Monday", "Won't say". */
  deliveryLabel: string;
  /** Whether all the quantity arrives by the restock's deadline. null when the supplier didn't say. */
  meetsDeadline: boolean | null;
  paymentTerms?: string;
  validUntil?: string;
  receivedAt: string;
  source: QuoteSource;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  askedAt: string;
  answer?: string;
  answeredAt?: string;
}

/** An append-only record of who decided what. Never rewritten by tools or actions. */
export interface AuditEvent {
  id: string;
  at: string;
  actor: "zeke" | "buyer" | "system";
  action: string;
  detail: string;
  restockId?: string;
  supplierId?: string;
}

export interface QuoteAssessment {
  supplierId: string;
  totalInclVat: number;
  eligible: boolean;
  reasons: string[];
}

/** The result of a deterministic comparison, stored on the restock for the buyer to see. */
export interface QuoteComparison {
  comparedAt: string;
  quantity: number;
  deadline: string;
  limit: number;
  assessed: QuoteAssessment[];
  winner?: { supplierId: string; totalInclVat: number; reason: string };
  overLimit?: { total: number; overBy: number };
}

export type PoStatus = "draft" | "approved" | "sent" | "held";

export interface PurchaseOrder {
  number: string;
  supplierId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  deliverBy: string;
  payment: string;
  checks: string[];
  status: PoStatus;
  draftedAt: string;
  approvedAt?: string;
  sentAt?: string;
  simulated?: boolean;
}

/**
 * proposed   → Zeke suggested a restock, waiting for the buyer's yes
 * approved   → buyer said yes, Zeke may ask suppliers
 * collecting → requests sent, quotes coming in
 * po-review  → a draft PO waits for the buyer
 * blocked    → the best option breaks a rule (spend limit), Zeke stopped
 * sent       → PO approved and sent
 * skipped    → buyer said no, nothing was sent
 */
export type RestockStatus = "proposed" | "approved" | "collecting" | "po-review" | "blocked" | "sent" | "skipped";

export interface RfqRecord {
  supplierId: string;
  channel: Channel;
  sentAt: string;
  simulated: boolean;
}

export interface Restock {
  id: string;
  itemId: string;
  quantity: number;
  estimate: number;
  supplierIds: string[];
  reason: string;
  /** Must-have delivery deadline in plain words, e.g. "Thursday". */
  deadline: string;
  mustHaves: string[];
  status: RestockStatus;
  sessionId?: string;
  createdAt: string;
  approvedAt?: string;
  rfqs: RfqRecord[];
  quotes: Quote[];
  questions: Question[];
  po?: PurchaseOrder;
  block?: { reason: string; total: number; supplierId: string; perUnitInclVat: number };
  /** Cheapest quote that met every must-have, computed by compare_quotes. */
  recommendation?: QuoteComparison;
  timeline: { at: string; text: string }[];
}

export interface ZekeState {
  version: number;
  company: Company;
  items: StockItem[];
  suppliers: Supplier[];
  restocks: Restock[];
  poCounter: number;
  activity: { at: string; text: string }[];
  auditLog: AuditEvent[];
}
