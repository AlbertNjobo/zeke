"use client";

import { markEmailRead } from "@/app/actions";
import { useEffect } from "react";

/** Marks unread supplier messages as read when their thread is opened. */
export function EmailReadMarker({ messages }: { messages: { restockId: string; messageId: string }[] }) {
  const signature = JSON.stringify(messages);
  useEffect(() => {
    for (const message of JSON.parse(signature) as { restockId: string; messageId: string }[]) {
      void markEmailRead(message.restockId, message.messageId).catch(() => undefined);
    }
  }, [signature]);
  return null;
}
