import { RiFileList3Line, RiMailLine, RiPhoneLine, RiWhatsappLine } from "@remixicon/react";
import type { Channel } from "@/lib/zeke/views";

export const channelIcon = {
  email: RiMailLine,
  whatsapp: RiWhatsappLine,
  phone: RiPhoneLine,
  po: RiFileList3Line,
} as const;

export const channelLabel: Record<Channel | "po", string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  phone: "Call",
  po: "Purchase order",
};
