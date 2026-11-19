"use client";

import { markEmailRead } from "@/app/actions";
import { useEffect } from "react";

/** Marks a supplier email as read when its message is opened. */
export function EmailReadMarker({ restockId, messageId }: { restockId: string; messageId: string }) {
  useEffect(() => {
    void markEmailRead(restockId, messageId).catch(() => undefined);
  }, [restockId, messageId]);
  return null;
}
