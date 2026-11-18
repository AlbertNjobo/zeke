import { defineTool } from "eve/tools";
import { z } from "zod";
import { appendAudit } from "../lib/zeke/audit";
import { restockById } from "../lib/zeke/logic";
import { updateState } from "../lib/zeke/store";

export default defineTool({
  description:
    "Record a decision or refusal that is not already logged automatically. Routine approvals, sends, quotes, comparisons and PO steps are audited by the app itself; use this for the important judgement calls in between.",
  inputSchema: z.object({
    action: z.string().min(1).describe("Short past-tense label, e.g. 'Asked buyer about missing delivery date'."),
    detail: z.string().min(1).describe("One plain sentence: what happened and why. No guesses."),
    restockId: z.string().optional(),
    supplierId: z.string().optional(),
  }),
  label: { start: ({ action }) => `Record: ${action}` },
  async execute(input) {
    return updateState((state) => {
      if (input.restockId && !restockById(state, input.restockId)) throw new Error(`No restock "${input.restockId}".`);
      appendAudit(state, {
        actor: "zeke",
        action: input.action,
        detail: input.detail,
        restockId: input.restockId,
        supplierId: input.supplierId,
      });
      return { recorded: true, next: "Continue the purchase; this note is now in the buyer's audit log." };
    });
  },
});
