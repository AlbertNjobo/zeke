import { itemById, openQuestions, supplierById, type ZekeState } from "@/lib/zeke/views";

export interface EmailMessageView {
  id: string;
  direction: "in" | "out";
  from: string;
  to: string;
  body: string;
  preview: string;
  at: string;
  attachments: { filename: string; url?: string }[];
  simulated: boolean;
  read: boolean;
  sourceId?: string;
  kind: "quote" | "chase" | "reply";
}

export interface EmailAction {
  label: string;
  detail: string;
  href: string;
  attention?: boolean;
}

export interface EmailThreadView {
  key: string;
  restockId: string;
  supplierId?: string;
  title: string;
  subject: string;
  preview: string;
  at: string;
  messages: EmailMessageView[];
  unread: number;
  hasAttachment: boolean;
  resolvedAt?: string;
  actions: EmailAction[];
}

const previewOf = (text: string) => text.replace(/\s+/g, " ").trim().slice(0, 160);

function actionsFor(state: ZekeState, restockId: string): EmailAction[] {
  const r = state.restocks.find((restock) => restock.id === restockId);
  if (!r) return [];
  const href = `/conversations/${r.id}`;
  const actions: EmailAction[] = [];
  if (r.status === "proposed") actions.push({ label: "Approve restock", detail: `Ask suppliers for ${r.quantity} units`, href, attention: true });
  if (r.status === "po-review" && r.po) actions.push({ label: `Review ${r.po.number}`, detail: "Approve before anything is sent", href, attention: true });
  if (r.status === "blocked") actions.push({ label: "Resolve spend limit", detail: r.block?.reason ?? "Best quote is over the limit", href, attention: true });
  for (const question of openQuestions(r)) actions.push({ label: "Answer question", detail: question.text, href, attention: true });
  if (r.shortlist?.status === "proposed") actions.push({ label: "Approve shortlist", detail: "Who Zeke may contact", href, attention: true });
  return actions;
}

/** Builds mail threads per restock and supplier — the procurement equivalent of one email conversation. */
export function emailThreads(state: ZekeState): EmailThreadView[] {
  const groups = new Map<string, EmailThreadView>();

  const ensure = (restockId: string, supplierId: string | undefined, fallbackName: string) => {
    const key = `${restockId}:${supplierId ?? fallbackName}`;
    let thread = groups.get(key);
    if (!thread) {
      const supplier = supplierId ? supplierById(state, supplierId) : undefined;
      const restock = state.restocks.find((r) => r.id === restockId);
      const item = restock ? itemById(state, restock.itemId) : undefined;
      thread = {
        key,
        restockId,
        supplierId,
        title: supplier?.name ?? fallbackName,
        subject: `Quote · ${item?.name ?? restock?.itemId ?? "restock"} × ${restock?.quantity ?? ""}`.trim(),
        preview: "",
        at: new Date(0).toISOString(),
        messages: [],
        unread: 0,
        hasAttachment: false,
        resolvedAt: state.emailThreads?.[key]?.resolvedAt,
        actions: actionsFor(state, restockId),
      };
      groups.set(key, thread);
    }
    return thread;
  };

  for (const r of state.restocks) {
    for (const m of r.inbound.filter((message) => message.channel === "email")) {
      const supplierId = supplierById(state, m.from)?.id;
      const thread = ensure(r.id, supplierId, m.from);
      const attachments = m.attachments ?? (m.attachment ? [{ filename: m.attachment }] : []);
      thread.messages.push({
        id: `in-${r.id}-${m.id}`,
        direction: "in",
        from: m.from,
        to: state.company.zekeEmail,
        body: m.text,
        preview: previewOf(m.text),
        at: m.receivedAt,
        attachments,
        simulated: false,
        read: Boolean(m.readAt),
        sourceId: m.id,
        kind: "quote",
      });
      if (!m.readAt) thread.unread += 1;
      if (attachments.length) thread.hasAttachment = true;
    }

    for (const q of r.rfqs.filter((record) => record.channel === "email")) {
      const supplier = supplierById(state, q.supplierId);
      const thread = ensure(r.id, q.supplierId, supplier?.email ?? q.supplierId);
      const body = q.message ?? `Quote request sent by Zeke for ${r.quantity} units of ${itemById(state, r.itemId)?.name ?? r.itemId}.`;
      thread.messages.push({
        id: `out-${r.id}-rfq-${q.supplierId}-${q.sentAt}`,
        direction: "out",
        from: state.company.zekeEmail,
        to: supplier?.email ?? q.supplierId,
        body,
        preview: previewOf(body),
        at: q.sentAt,
        attachments: [],
        simulated: q.simulated,
        read: true,
        kind: "quote",
      });
    }

    for (const c of r.chases.filter((record) => record.channel === "email")) {
      const supplier = supplierById(state, c.supplierId);
      const thread = ensure(r.id, c.supplierId, supplier?.email ?? c.supplierId);
      thread.messages.push({
        id: `out-${r.id}-chase-${c.supplierId}-${c.sentAt}`,
        direction: "out",
        from: state.company.zekeEmail,
        to: supplier?.email ?? c.supplierId,
        body: c.note,
        preview: previewOf(c.note),
        at: c.sentAt,
        attachments: [],
        simulated: c.simulated,
        read: true,
        kind: "chase",
      });
    }

    for (const reply of r.emailReplies ?? []) {
      const supplier = supplierById(state, reply.supplierId);
      const thread = ensure(r.id, reply.supplierId, supplier?.email ?? reply.supplierId);
      thread.messages.push({
        id: `out-${r.id}-reply-${reply.id}`,
        direction: "out",
        from: state.company.zekeEmail,
        to: reply.to,
        body: reply.text,
        preview: previewOf(reply.text),
        at: reply.sentAt,
        attachments: [],
        simulated: reply.simulated,
        read: true,
        kind: "reply",
      });
    }
  }

  return [...groups.values()]
    .map((thread) => {
      const messages = thread.messages.sort((a, b) => a.at.localeCompare(b.at));
      const last = messages.at(-1);
      return {
        ...thread,
        messages,
        at: last?.at ?? thread.at,
        preview: last?.preview ?? thread.preview,
      };
    })
    .sort((a, b) => b.at.localeCompare(a.at));
}
