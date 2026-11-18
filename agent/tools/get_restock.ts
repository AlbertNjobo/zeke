import { defineTool } from "eve/tools";
import { z } from "zod";
import { restockById } from "../lib/zeke/logic";
import { readState } from "../lib/zeke/store";
import { summarizeRestock } from "../lib/zeke/summary";

export default defineTool({
  description: "Read one restock's current state: suppliers asked, quotes filed, open questions, PO and status.",
  inputSchema: z.object({ restockId: z.string() }),
  label: false,
  async execute({ restockId }) {
    const state = await readState();
    const r = restockById(state, restockId);
    if (!r) throw new Error(`No restock "${restockId}".`);
    return summarizeRestock(state, r);
  },
});
