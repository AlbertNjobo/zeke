"use client";

import { useState, useTransition } from "react";
import { replyToSupplier } from "@/app/actions";
import { Button } from "@/components/base/buttons/button";
import { Textarea } from "@/components/base/textarea/textarea";

export function EmailComposer({ restockId, supplierId, supplierName }: { restockId: string; supplierId: string; supplierName: string }) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [pending, startTransition] = useTransition();

  function send(event: React.FormEvent) {
    event.preventDefault();
    setError(undefined);
    setNotice(undefined);
    startTransition(async () => {
      const result = await replyToSupplier(restockId, supplierId, text);
      if (!result.ok) {
        setError(result.error ?? "The reply could not be sent.");
        return;
      }
      setText("");
      setNotice(result.simulated ? "Reply recorded (simulated — nothing left the machine)." : "Reply sent.");
    });
  }

  return (
    <form onSubmit={send} className="flex flex-col gap-3 rounded-2xl border border-border-button-default bg-background-primary-default p-4">
      <Textarea
        label={`Reply to ${supplierName}`}
        value={text}
        onChange={setText}
        rows={3}
        maxLength={2000}
        showCount
        placeholder="Write a short follow-up…"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending || !text.trim()}>{pending ? "Sending…" : "Send reply"}</Button>
        <span role="status" className="text-body-2-regular text-text-secondary">{notice}</span>
        {error ? <span role="alert" className="text-body-2-regular text-text-error-primary">{error}</span> : null}
      </div>
    </form>
  );
}
