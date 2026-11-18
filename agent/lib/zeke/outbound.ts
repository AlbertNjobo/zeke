import type { Channel, Company, Supplier } from "./types";

export interface OutboundResult {
  channel: Channel;
  to: string;
  message: string;
  simulated: true;
}

/**
 * Sends a message from Zeke's own email, WhatsApp number or phone line.
 *
 * Every send is simulated for now: Zeke records exactly what it would send and to whom, and
 * nothing leaves the machine. Real providers (Resend for email, a WhatsApp and voice provider)
 * plug in here, behind an explicit opt-in, once the buyer's sending identity is set up.
 */
export async function sendFromZeke(supplier: Supplier, channel: Channel, message: string, _company: Company): Promise<OutboundResult> {
  const to = channel === "email" ? supplier.email : supplier.phone;
  return { channel, to, message, simulated: true };
}

export function rfqMessage(opts: { company: Company; supplier: Supplier; itemName: string; quantity: number; unit: string; deadline: string }) {
  const { company, supplier, itemName, quantity, unit, deadline } = opts;
  const first = supplier.contact.split(/[ ,]/)[0];
  return `Hi ${first}, this is Zeke for ${company.name}. Could you quote ${quantity} ${unit} of ${itemName}, all delivered by ${deadline}? Please include the price per unit, delivery date and payment terms.`;
}
