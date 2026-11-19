import { defineTool } from "eve/tools";
import { z } from "zod";
import { appendAudit } from "../lib/zeke/audit";
import { itemById, nowIso, restockById, supplierById } from "../lib/zeke/logic";
import { rfqMessage, sendFromZeke, type OutboundResult } from "../lib/zeke/outbound";
import { readState, updateState } from "../lib/zeke/store";

export default defineTool({
  description:
    "Ask every supplier on an approved restock for a quote, each on the channel they answer (email, WhatsApp or phone). Runs only after the buyer approved the restock in the app.",
  inputSchema: z.object({ restockId: z.string() }),
  label: { start: ({ restockId }) => `Ask suppliers for quotes (${restockId})` },
  // The buyer's approval lives in the app. This policy checks it before any supplier is contacted.
  approval: async ({ toolInput }) => {
    const id = (toolInput as { restockId?: string } | undefined)?.restockId;
    if (!id) return { type: "denied", reason: "No restockId given." };
    const state = await readState();
    const restock = restockById(state, id);
    if (!restock) return { type: "denied", reason: `No restock "${id}".` };
    if (restock.shortlist && restock.shortlist.status !== "approved") {
      return { type: "denied", reason: "The buyer hasn't approved this shortlist yet. Wait for their approval in the app." };
    }
    if (restock.supplierIds.some((sid) => !supplierById(state, sid)?.approved)) {
      return { type: "denied", reason: "A supplier on this restock is new and hasn't been approved. Wait for the buyer." };
    }
    if (restock.status === "approved") return "approved";
    if (restock.status === "proposed") return { type: "denied", reason: "The buyer hasn't approved this restock yet. Wait for their yes in the app." };
    return { type: "denied", reason: `Requests already went out or this restock is ${restock.status}.` };
  },
  async execute({ restockId }) {
    const state = await readState();
    const restock = restockById(state, restockId);
    if (!restock) throw new Error(`No restock "${restockId}".`);
    const item = itemById(state, restock.itemId);
    const sent: Array<{ supplierId: string; supplier: string } & OutboundResult> = [];
    for (const supplierId of restock.supplierIds) {
      const supplier = supplierById(state, supplierId);
      if (!supplier) continue;
      const approvedDraft = restock.shortlist?.status === "approved"
        ? restock.shortlist.entries.find((e) => e.supplierId === supplierId)?.draftMessage
        : undefined;
      const message = approvedDraft ?? rfqMessage({
        company: state.company,
        supplier,
        itemName: item?.name ?? restock.itemId,
        quantity: restock.quantity,
        unit: item?.unit ?? "units",
        deadline: restock.deadline,
      });
      sent.push({ supplierId, supplier: supplier.name, ...(await sendFromZeke(supplier, supplier.preferredChannel, message, state.company)) });
    }

    await updateState((s) => {
      const r = restockById(s, restockId);
      if (!r || r.status !== "approved") throw new Error("This restock changed while sending. Check it again.");
      const at = nowIso();
      r.status = "collecting";
      for (const x of sent) {
        r.rfqs.push({ supplierId: x.supplierId, channel: x.channel, sentAt: at, simulated: x.simulated, message: x.message });
        supplierById(s, x.supplierId)?.history.unshift({
          channel: x.channel,
          title: `Zeke asked for a quote on ${r.quantity} ${item?.name ?? r.itemId}`,
          meta: `${x.channel === "phone" ? "Call" : x.channel === "email" ? "Email" : "WhatsApp"} · simulated, nothing left the machine`,
          at,
        });
      }
      r.timeline.push({ at, text: `Asked ${sent.length} suppliers for quotes` });
      s.activity.unshift({ at, text: `Asked ${sent.length} suppliers about ${item?.name ?? r.itemId}` });
      appendAudit(s, {
        actor: "zeke",
        action: "Sent RFQs",
        detail: `${sent.length} simulated requests by ${[...new Set(sent.map((x) => x.channel))].join(", ")} after the buyer approved restock ${restockId}.`,
        restockId,
      });
    });

    return {
      restockId,
      status: "collecting",
      sent: sent.map(({ supplier, channel, to, message }) => ({ supplier, channel, to, message })),
      note: "Sending is simulated in this demo. Replies arrive as [Inbound …] or [Call transcript …] messages.",
    };
  },
});
