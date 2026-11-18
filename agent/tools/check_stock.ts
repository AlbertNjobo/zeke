import { defineTool } from "eve/tools";
import { z } from "zod";
import { daysLeft, isLow, isOpen } from "../lib/zeke/logic";
import { readState } from "../lib/zeke/store";
import { summarizeRestock } from "../lib/zeke/summary";

export default defineTool({
  description:
    "Read current stock. Returns items below their reorder point that have no open restock yet, and every open restock with its status.",
  inputSchema: z.object({}),
  label: { start: () => "Check stock" },
  async execute() {
    const state = await readState();
    const open = state.restocks.filter(isOpen);
    const covered = new Set(open.map((r) => r.itemId));
    const needsRestock = state.items
      .filter((i) => isLow(i) && !covered.has(i.id))
      .map((i) => ({
        itemId: i.id,
        name: i.name,
        onHand: i.onHand,
        reorderPoint: i.reorderPoint,
        unit: i.unit,
        dailyUse: i.dailyUse,
        daysLeft: daysLeft(i),
        usualQuantity: i.usualQuantity,
      }));
    return {
      checkedItems: state.items.length,
      needsRestock,
      openRestocks: open.map((r) => summarizeRestock(state, r)),
    };
  },
});
