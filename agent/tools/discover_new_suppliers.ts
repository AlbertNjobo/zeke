import { defineTool } from "eve/tools";
import { z } from "zod";
import { updateState } from "../lib/zeke/store";
import { addCandidateSupplier } from "../lib/zeke/suppliers";

export default defineTool({
  description:
    "Record candidate suppliers the buyer pasted or you found with official web search or Places. Use public sources only; never scrape directories. Every candidate is stored as new and unapproved until the buyer approves the shortlist.",
  inputSchema: z.object({
    itemId: z.string(),
    candidates: z
      .array(
        z.object({
          name: z.string().min(1),
          contact: z.string().min(1).describe("Named contact or desk."),
          email: z.string().optional(),
          phone: z.string().optional(),
          preferredChannel: z.enum(["email", "whatsapp", "phone"]),
          categories: z.string().describe("What they supply."),
          sourceUrl: z.string().url().describe("Public URL where you found or verified them."),
          vettingNote: z.string().describe("One sentence on location, category fit and any obvious gap."),
        }),
      )
      .min(1)
      .max(8),
  }),
  label: { start: ({ candidates }) => `Record ${candidates.length} new supplier candidates` },
  async execute({ itemId, candidates }) {
    return updateState((state) => {
      const added = candidates.map((c) =>
        addCandidateSupplier(state, {
          name: c.name,
          contact: c.contact,
          email: c.email,
          phone: c.phone,
          preferredChannel: c.preferredChannel,
          categories: c.categories,
          itemIds: [itemId],
          sourceUrl: c.sourceUrl,
          vettingNote: c.vettingNote,
        }),
      );
      return {
        added,
        next: "Propose a shortlist with propose_shortlist. The buyer must approve it before any RFQ goes out, and new suppliers never skip that gate.",
      };
    });
  },
});
