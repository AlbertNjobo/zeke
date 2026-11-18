import { defineTool } from "eve/tools";
import { z } from "zod";
import { appendAudit } from "../lib/zeke/audit";
import { nowIso, restockById, supplierById } from "../lib/zeke/logic";
import { updateState } from "../lib/zeke/store";
import type { QuoteSource } from "../lib/zeke/types";

export default defineTool({
  description:
    "File one supplier's quote on a restock, with the supplier's own words as the source. Use null for meetsDeadline when the supplier didn't say. Never invent a number the supplier didn't give.",
  inputSchema: z.object({
    restockId: z.string(),
    supplierId: z.string(),
    channel: z.enum(["email", "whatsapp", "phone"]),
    perUnit: z.number().positive().describe("Price per unit before VAT, in AED."),
    deliveryLabel: z.string().describe('Delivery in plain words, e.g. "Thursday", "Next Monday", "Won\'t say".'),
    meetsDeadline: z.boolean().nullable().describe("True only if the supplier confirmed the full quantity by the restock deadline."),
    paymentTerms: z.string().optional(),
    validUntil: z.string().optional(),
    excerpt: z
      .string()
      .describe("The supplier's own words, verbatim. For a call, one line per turn as 'Name: words'."),
    fieldsUsed: z.array(z.object({ label: z.string(), value: z.string() })).describe("The values you read from the reply, e.g. Price, Lead time."),
    attachment: z.string().optional().describe("Attachment file name, if the quote came as a file."),
    flag: z.string().optional().describe("What's missing or unclear, in one sentence."),
  }),
  label: { start: ({ supplierId }) => `File ${supplierId}'s quote` },
  async execute(input) {
    return updateState((state) => {
      const r = restockById(state, input.restockId);
      if (!r) throw new Error(`No restock "${input.restockId}".`);
      const supplier = supplierById(state, input.supplierId);
      if (!supplier) throw new Error(`No supplier "${input.supplierId}".`);
      const at = nowIso();

      let source: QuoteSource;
      if (input.channel === "email") {
        source = {
          kind: "email",
          from: supplier.email,
          subject: `Re: Quote request · ${r.quantity} × ${r.itemId}`,
          body: input.excerpt,
          attachment: input.attachment,
          fields: input.fieldsUsed.map((f) => ({ ...f, used: true })),
        };
      } else if (input.channel === "phone") {
        source = {
          kind: "phone",
          recording: `Zeke's line → ${supplier.name}`,
          lines: input.excerpt
            .split("\n")
            .filter(Boolean)
            .map((line, i) => {
              const [who, ...rest] = line.split(":");
              return { at: `${i}:00`, who: rest.length ? who.trim() : supplier.contact, text: rest.length ? rest.join(":").trim() : line, used: true };
            }),
          note: input.flag ?? "Lines from the call that went into the comparison.",
        };
      } else {
        source = {
          kind: "whatsapp",
          messages: input.excerpt
            .split("\n")
            .filter(Boolean)
            .map((text) => ({ from: "supplier" as const, text, at: "" })),
          flag: input.flag,
        };
      }

      r.quotes = r.quotes.filter((q) => q.supplierId !== input.supplierId);
      // A new or replaced quote makes any earlier comparison stale.
      r.recommendation = undefined;
      r.quotes.push({
        supplierId: input.supplierId,
        channel: input.channel,
        perUnit: input.perUnit,
        deliveryLabel: input.deliveryLabel,
        meetsDeadline: input.meetsDeadline,
        paymentTerms: input.paymentTerms,
        validUntil: input.validUntil,
        receivedAt: at,
        source,
      });
      if (r.status === "approved") r.status = "collecting";
      supplier.history.unshift({
        channel: input.channel,
        title: `Quote · AED ${input.perUnit.toFixed(2)} per unit, ${input.deliveryLabel}`,
        meta: input.flag ? `Flagged: ${input.flag}` : "Zeke filed it with the restock",
        at,
      });
      r.timeline.push({ at, text: `Filed ${supplier.name}'s quote` });
      state.activity.unshift({ at, text: `Filed ${supplier.name}'s quote` });
      appendAudit(state, {
        actor: "zeke",
        action: "Filed quote",
        detail: `${supplier.name}, AED ${input.perUnit.toFixed(2)} per unit, ${input.deliveryLabel}${input.flag ? `. Flagged: ${input.flag}` : ""}.`,
        restockId: input.restockId,
        supplierId: input.supplierId,
      });

      const waitingOn = r.supplierIds.filter((id) => !r.quotes.some((q) => q.supplierId === id)).map((id) => supplierById(state, id)?.name);
      return { filed: true, quotesIn: r.quotes.length, waitingOn, allIn: waitingOn.length === 0 };
    });
  },
});
