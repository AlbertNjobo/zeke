import { itemById, round2, supplierById } from "@zeke/logic";
import type { Channel, Restock, ZekeState } from "@zeke/types";

export interface DemoReply {
  channel: Channel;
  from: string;
  text: string;
  subject?: string;
  attachment?: string;
}

/**
 * Stand-in supplier replies for the demo, until Zeke's real inbox and phone line are connected.
 * Each supplier answers on its own channel, and the last one leaves out the delivery date on
 * purpose, so Zeke has to flag it instead of guessing.
 */
export function demoReplies(state: ZekeState, r: Restock): DemoReply[] {
  const item = itemById(state, r.itemId);
  const base = item?.lastUnitPrice ?? 10;
  const unit = item?.unit ?? "units";
  const name = item?.name ?? r.itemId;
  const pending = r.supplierIds.filter((id) => !r.quotes.some((q) => q.supplierId === id));

  return pending.flatMap((id, i): DemoReply[] => {
    const s = supplierById(state, id);
    if (!s) return [];
    const price = round2(base * [1.02, 0.97, 0.94][i % 3]).toFixed(2);
    if (s.preferredChannel === "email") {
      return [
        {
          channel: "email",
          from: s.email,
          subject: `Re: Quote request · ${name} × ${r.quantity}`,
          text: `Hi Zeke, please find our quotation attached. Stock is available and we can deliver all ${r.quantity} ${unit} within 3 working days of the PO, so before ${r.deadline}. Regards, ${s.contact.split(",")[0]}`,
          attachment: `Quote_${s.initials}-${Math.floor(2300 + Math.random() * 600)}.pdf (text extracted: Price AED ${price} per ${unit.replace(/s$/, "")}. Lead time 3 working days. Payment 30 days. Valid 7 days.)`,
        },
      ];
    }
    if (s.preferredChannel === "phone") {
      return [
        {
          channel: "phone",
          from: s.name,
          text: [
            `Zeke: Could you quote ${r.quantity} ${unit} of ${name}, all delivered by ${r.deadline}?`,
            `${s.contact.split(",")[0]}: ${price} each. I have about two thirds in stock, the rest comes early next week.`,
            `Zeke: Could the full ${r.quantity} arrive by ${r.deadline}?`,
            `${s.contact.split(",")[0]}: No, next Monday at the earliest for all of it.`,
          ].join("\n"),
        },
      ];
    }
    return [
      {
        channel: "whatsapp",
        from: s.name,
        text: `${price} per ${unit.replace(/s$/, "")} habibi\nwill check delivery and confirm`,
      },
    ];
  });
}
