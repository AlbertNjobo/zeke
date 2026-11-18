import { defineTool } from "eve/tools";
import { z } from "zod";
import { newId, nowIso, restockById } from "../lib/zeke/logic";
import { updateState } from "../lib/zeke/store";

export default defineTool({
  description:
    "Put one clear question to the buyer on a restock, with 2–3 short answer options. It appears under Needs you in the app; the answer comes back as an [App] message.",
  inputSchema: z.object({
    restockId: z.string(),
    question: z.string().describe("One sentence the buyer can answer at a glance."),
    options: z.array(z.string()).min(2).max(3),
  }),
  label: { start: () => "Ask the buyer" },
  async execute({ restockId, question, options }) {
    return updateState((state) => {
      const r = restockById(state, restockId);
      if (!r) throw new Error(`No restock "${restockId}".`);
      const at = nowIso();
      r.questions.push({ id: newId("q"), text: question, options, askedAt: at });
      r.timeline.push({ at, text: `Asked you: ${question}` });
      return { asked: true, next: "Wait for the buyer's answer in an [App] message." };
    });
  },
});
