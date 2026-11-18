import { itemById, round2, supplierById } from "@zeke/logic";
import type { Restock, ZekeState } from "@zeke/types";

/**
 * Stand-in supplier replies for the demo, until Zeke's real inbox and phone line are connected.
 * Each supplier answers on its own channel, and the last one leaves out the delivery date on
 * purpose, so Zeke has to flag it instead of guessing.
 */
export function demoReplies(state: ZekeState, r: Restock) {
  const item = itemById(state, r.itemId);
  const base = item?.lastUnitPrice ?? 10;
  const unit = item?.unit ?? "units";
  const name = item?.name ?? r.itemId;
  const pending = r.supplierIds.filter((id) => !r.quotes.some((q) => q.supplierId === id));

  const replies = pending.map((id, i) => {
    const s = supplierById(state, id);
    if (!s) return "";
    const price = round2(base * [1.02, 0.97, 0.94][i % 3]).toFixed(2);
    if (s.preferredChannel === "email") {
      return [
        `[Inbound email from ${s.email} to ${state.company.zekeEmail}]`,
        `Subject: Re: Quote request · ${name} × ${r.quantity}`,
        `Hi Zeke, please find our quotation attached. Stock is available and we can deliver all ${r.quantity} ${unit} within 3 working days of the PO, so before ${r.deadline}. Regards, ${s.contact.split(",")[0]}`,
        `Attachment: Quote_${s.initials}-${Math.floor(2300 + Math.random() * 600)}.pdf (text extracted: Price AED ${price} per ${unit.replace(/s$/, "")}. Lead time 3 working days. Payment 30 days. Valid 7 days.)`,
      ].join("\n");
    }
    if (s.preferredChannel === "phone") {
      return [
        `[Call transcript · Zeke's line → ${s.name}, 2:48]`,
        `Zeke: Could you quote ${r.quantity} ${unit} of ${name}, all delivered by ${r.deadline}?`,
        `${s.contact.split(",")[0]}: ${price} each. I have about two thirds in stock, the rest comes early next week.`,
        `Zeke: Could the full ${r.quantity} arrive by ${r.deadline}?`,
        `${s.contact.split(",")[0]}: No, next Monday at the earliest for all of it.`,
      ].join("\n");
    }
    return [
      `[Inbound WhatsApp from ${s.name} to Zeke's number]`,
      `${price} per ${unit.replace(/s$/, "")} habibi`,
      `will check delivery and confirm`,
    ].join("\n");
  });

  return replies.filter(Boolean).join("\n\n");
}
