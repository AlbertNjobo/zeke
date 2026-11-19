import { defineTool } from "eve/tools";
import { z } from "zod";
import { rankSuppliers, resolveItem, validItemRefs } from "../lib/zeke/logic";
import { readState } from "../lib/zeke/store";

export default defineTool({
  description:
    "Read the buyer's own supplier directory and rank approved suppliers that already carry an item. Pass an exact id from check_stock, a SKU, a name, or a fragment like 'gloves'. Read only; contacts nobody.",
  inputSchema: z.object({ itemId: z.string().describe("Item id, SKU, name or name fragment from the stock list.") }),
  label: { start: ({ itemId }) => `Search known suppliers for ${itemId}` },
  async execute({ itemId }) {
    const state = await readState();
    const item = resolveItem(state, itemId);
    if (!item) throw new Error(`No item matching "${itemId}". Valid items: ${validItemRefs(state)}.`);
    return { item: item.name, itemId: item.id, suppliers: rankSuppliers(state, item.id) };
  },
});
