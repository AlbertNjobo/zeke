import { defineTool } from "eve/tools";
import { z } from "zod";
import { formatMoney, nowIso, poTotals, restockById, supplierById } from "../lib/zeke/logic";
import { sendFromZeke } from "../lib/zeke/outbound";
import { readState, updateState } from "../lib/zeke/store";

export default defineTool({
  description: "Send an approved purchase order to its supplier by email from Zeke's address. Runs only after the buyer approved the PO in the app.",
  inputSchema: z.object({ restockId: z.string() }),
  label: { start: () => "Send the purchase order" },
  // Spending money: refuse unless the buyer approved this exact PO in the app and it is under the limit.
  approval: async ({ toolInput }) => {
    const id = (toolInput as { restockId?: string } | undefined)?.restockId;
    if (!id) return { type: "denied", reason: "No restockId given." };
    const state = await readState();
    const r = restockById(state, id);
    if (!r?.po) return { type: "denied", reason: "This restock has no purchase order." };
    if (poTotals(r.po, state.company.vatRate).total > state.company.orderLimit) {
      return { type: "denied", reason: "This PO is over the spend limit and can't be sent." };
    }
    if (r.po.status === "approved") return "approved";
    if (r.po.status === "sent") return { type: "denied", reason: "This PO was already sent." };
    return { type: "denied", reason: "The buyer hasn't approved this PO. Wait for their approval in the app." };
  },
  async execute({ restockId }) {
    const state = await readState();
    const r = restockById(state, restockId);
    const po = r?.po;
    const supplier = po ? supplierById(state, po.supplierId) : undefined;
    if (!r || !po || !supplier) throw new Error("Purchase order or supplier not found.");
    const { total } = poTotals(po, state.company.vatRate);
    const result = await sendFromZeke(
      supplier,
      "email",
      `${po.number}: ${po.quantity} × ${po.description} at AED ${po.unitPrice.toFixed(2)}, total AED ${formatMoney(total, 2)} incl. VAT. Deliver to ${state.company.deliveryAddress} by ${po.deliverBy}.`,
      state.company,
    );

    await updateState((s) => {
      const rr = restockById(s, restockId);
      if (!rr?.po || rr.po.status !== "approved") throw new Error("PO changed while sending. Check it again.");
      const at = nowIso();
      rr.po.status = "sent";
      rr.po.sentAt = at;
      rr.po.simulated = result.simulated;
      rr.status = "sent";
      rr.timeline.push({ at, text: `Sent ${rr.po.number} to ${supplier.name}` });
      supplierById(s, supplier.id)?.history.unshift({
        channel: "po",
        title: `${rr.po.number} sent · ${rr.po.quantity} ${rr.po.description} · AED ${formatMoney(total)}`,
        meta: "By email from Zeke · simulated, nothing left the machine",
        at,
      });
      s.activity.unshift({ at, text: `Sent ${rr.po.number}` });
    });

    return { sent: true, poNumber: po.number, to: result.to, simulated: result.simulated };
  },
});
