import { defineTool } from "eve/tools";
import { z } from "zod";
import { itemById, rankSuppliers } from "../lib/zeke/logic";
import { readState } from "../lib/zeke/store";

export default defineTool({
  description:
    "Read the buyer's own supplier directory and rank approved suppliers that already carry an item. This is a read only; it contacts nobody.",
  inputSchema: z.object({ itemId: z.string().describe("Item id from a restock or the stock list.") }),
  label: { start: ({ itemId }) => `Search known suppliers for ${itemId}` },
  async execute({ itemId }) {
    const state = await readState();
    const item = itemById(state, itemId);
    if (!item) throw new Error(`No item "${itemId}".`);
    return { item: item.name, suppliers: rankSuppliers(state, itemId) };
  },
});
