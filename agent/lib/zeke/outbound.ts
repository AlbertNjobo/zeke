import { createHash } from "node:crypto";
import type { Channel, Company, Supplier } from "./types";

export interface OutboundResult {
  channel: Channel;
  to: string;
  message: string;
  simulated: boolean;
  providerMessageId?: string;
}

/**
 * Sends from Zeke's own inbox. Email goes through Resend when ZEKE_EMAIL_ENABLED=1 and the
 * RESEND_API_KEY / ZEKE_FROM_EMAIL env vars are set; every other path stays simulated until its
 * provider is connected. A stable idempotency key is derived from the exact message, so a retried
 * tool call cannot send the same email twice.
 */
export async function sendFromZeke(supplier: Supplier, channel: Channel, message: string, _company: Company): Promise<OutboundResult> {
  const to = channel === "email" ? supplier.email : supplier.phone;
  // Demo suppliers have placeholder addresses like sales@[gulfmedical]. Never send to those.
  const placeholderAddress = to.includes("[") || to.includes("]") || /@(example\.)/i.test(to);
  const canSendEmail =
    channel === "email" &&
    process.env.ZEKE_EMAIL_ENABLED === "1" &&
    !placeholderAddress &&
    Boolean(process.env.RESEND_API_KEY) &&
    Boolean(process.env.ZEKE_FROM_EMAIL);

  if (!canSendEmail) return { channel, to, message, simulated: true };

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const digest = createHash("sha256").update(`${channel}:${to}:${message}`).digest("hex").slice(0, 32);
  const subject = /PO-\d+/.test(message) ? "Purchase order from Zeke" : "Quote request from Zeke";
  const { data, error } = await resend.emails.send(
    { from: process.env.ZEKE_FROM_EMAIL!, to: [to], subject, text: message },
    { idempotencyKey: `zeke-email/${digest}` },
  );
  if (error) throw new Error(`Resend could not send to ${to}: ${error.message}`);
  if (!data?.id) throw new Error(`Resend returned no message id for ${to}.`);
  return { channel, to, message, simulated: false, providerMessageId: data.id };
}

export function rfqMessage(opts: { company: Company; supplier: Supplier; itemName: string; quantity: number; unit: string; deadline: string }) {
  const { company, supplier, itemName, quantity, unit, deadline } = opts;
  const first = supplier.contact.split(/[ ,]/)[0];
  return `Hi ${first}, this is Zeke for ${company.name}. Could you quote ${quantity} ${unit} of ${itemName}, all delivered by ${deadline}? Please include the price per unit, delivery date and payment terms.`;
}
