"use client";

import { RiRefreshLine, RiSearchEyeLine } from "@remixicon/react";
import { useState, useTransition } from "react";
import { resetDemo, runStockCheck } from "@/app/actions";
import { Button } from "@/components/base/buttons/button";

export function HomeActions() {
  const [pending, start] = useTransition();
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string }>();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {notice ? (
        <span role={notice.tone === "error" ? "alert" : "status"} className={notice.tone === "error" ? "text-body-2-regular text-text-error-primary" : "text-body-2-regular text-state-success-text"}>
          {notice.text}
        </span>
      ) : null}
      <Button
        variant="secondary"
        size="small"
        leadingIcon={RiRefreshLine}
        disabled={pending}
        onClick={() =>
          start(async () => {
            await resetDemo();
            setNotice({ tone: "ok", text: "Demo reset." });
          })
        }
      >
        Reset demo
      </Button>
      <Button
        size="small"
        leadingIcon={RiSearchEyeLine}
        disabled={pending}
        onClick={() =>
          start(async () => {
            const result = await runStockCheck();
            setNotice(result.ok ? { tone: "ok", text: "Zeke is checking stock." } : { tone: "error", text: result.error ?? "Zeke didn't get that." });
          })
        }
      >
        Run stock check
      </Button>
    </div>
  );
}
