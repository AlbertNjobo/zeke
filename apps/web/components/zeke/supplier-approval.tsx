"use client";

import { useState, useTransition } from "react";
import { approveSupplier } from "@/app/actions";
import { Button } from "@/components/base/buttons/button";

export function SupplierApproval({ supplierId, name }: { supplierId: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button
        size="small"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(undefined);
            try {
              await approveSupplier(supplierId);
            } catch (e) {
              setError(e instanceof Error ? e.message : "That didn't work.");
            }
          })
        }
      >
        Approve {name}
      </Button>
      {error ? <span role="alert" className="text-body-2-regular text-text-error-primary">{error}</span> : null}
    </div>
  );
}
