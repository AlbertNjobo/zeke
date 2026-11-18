import { defineTool } from "eve/tools";
import { z } from "zod";
import { updateState } from "../lib/zeke/store";
import { addCandidateSupplier } from "../lib/zeke/suppliers";

export default defineTool({
  description:
    "Add one supplier the buyer names to the directory. It is stored as new and unapproved; only the buyer can approve it in the Suppliers screen, and nothing is sent by this tool.",
  inputSchema: z.object({
    name: z.string().min(1),
    contact: z.string().min(1),
    email: z.string().optional(),
    phone: z.string().optional(),
    preferredChannel: z.enum(["email", "whatsapp", "phone"]),
    categories: z.string(),
    itemIds: z.array(z.string()).min(1),
    vettingNote: z.string().describe("One sentence on why this supplier is worth considering."),
  }),
  label: { start: ({ name }) => `Add ${name} to the directory` },
  async execute(input) {
    return updateState((state) => {
      const result = addCandidateSupplier(state, input);
      return {
        ...result,
        next: result.status === "new" ? "Tell the buyer to approve this supplier in the Suppliers screen before contacting them." : "Already in the directory.",
      };
    });
  },
});
