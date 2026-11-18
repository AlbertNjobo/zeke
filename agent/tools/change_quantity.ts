import { defineTool } from "eve/tools";
import { z } from "zod";
import { appendAudit } from "../lib/zeke/audit";
import { nowIso, restockById } from "../lib/zeke/logic";
import { updateState } from "../lib/zeke/store";

export default defineTool({
  description:
    "Change how much a restock orders, when the buyer asks (for example to get under the spend limit). Only before a PO is sent. Afterwards, draft the PO again with draft_po.",
  inputSchema: z.object({ restockId: z.string(), quantity: z.number().int().positive(), why: z.string() }),
  label: { start: ({ quantity }) => `Change the amount to ${quantity}` },
  async execute({ restockId, quantity, why }) {
    return updateState((state) => {
      const r = restockById(state, restockId);
      if (!r) throw new Error(`No restock "${restockId}".`);
      if (r.status === "sent" || r.status === "skipped") throw new Error(`This restock is ${r.status}; its amount can't change.`);
      const at = nowIso();
      const before = r.quantity;
      r.quantity = quantity;
      r.mustHaves = r.mustHaves.map((m) => m.replace(String(before), String(quantity)));
      if (r.po && r.po.status !== "sent") r.po = undefined;
      r.recommendation = undefined; // totals changed; the quotes must be compared again
      if (r.status === "blocked" || r.status === "po-review") r.status = "collecting";
      r.block = undefined;
      r.timeline.push({ at, text: `Changed the amount from ${before} to ${quantity}. ${why}` });
      appendAudit(state, { actor: "buyer", action: "Changed quantity", detail: `${before} → ${quantity}. ${why}`, restockId });
      return { restockId, quantity, next: "Call compare_quotes again, then draft_po with the winning supplier." };
    });
  },
});
