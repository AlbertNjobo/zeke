"use client";

import { RiCheckLine } from "@remixicon/react";
import { useState, useTransition } from "react";
import { approveRestock, skipRestock } from "@/app/actions";
import { Button } from "@/components/base/buttons/button";

interface ProposalCardProps {
  restockId: string;
  itemName: string;
  onHand: number;
  reorderPoint: number;
  unit: string;
  quantity: number;
  supplierCount: number;
  estimate: string;
}

/** A restock proposal answered right on Home. Asking for quotes spends nothing; the PO still waits for its own review. */
export function ProposalCard(p: ProposalCardProps) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState<string>();
  const [error, setError] = useState<string>();

  function act(kind: "approve" | "skip") {
    setError(undefined);
    start(async () => {
      try {
        const result = kind === "approve" ? await approveRestock(p.restockId) : await skipRestock(p.restockId);
        if (!result.ok) setError(result.error);
        setDone(kind === "approve" ? "Zeke is asking suppliers now." : "Skipped. Nothing was sent.");
      } catch (e) {
        setError(e instanceof Error ? e.message : "That didn't work. Try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-3xl border border-accent-200 bg-background-primary-default p-4.5">
      <span className="font-mono text-caption-1-medium uppercase text-accent-700">Restock proposal · {p.itemName}</span>
      <p className="text-title-3-medium">
        Down to {p.onHand} {p.unit}, reorder point is {p.reorderPoint}. Ask your {p.supplierCount} suppliers for {p.quantity} {p.unit}?
      </p>
      {done ? (
        <p className="flex items-center gap-2 text-body-medium text-state-success-text" role="status">
          <RiCheckLine className="size-4.5 text-state-success-mark" aria-hidden />
          {done}
        </p>
      ) : (
        <>
          <p className="text-body-regular text-text-secondary">{p.estimate}. Asking costs nothing. You approve the PO later.</p>
          <div className="flex flex-wrap gap-2">
            <Button disabled={pending} onClick={() => act("approve")}>
              Ask for quotes
            </Button>
            <Button variant="secondary" disabled={pending} onClick={() => act("skip")}>
              Skip this time
            </Button>
          </div>
        </>
      )}
      {error ? (
        <p role="alert" className="text-body-2-regular text-text-error-primary">
          {error}
        </p>
      ) : null}
    </div>
  );
}
