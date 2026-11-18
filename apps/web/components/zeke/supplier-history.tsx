"use client";

import { useState } from "react";
import { channelIcon, channelLabel } from "@/components/zeke/channel";
import { longTime, type Channel, type Supplier } from "@/lib/zeke/views";
import { cx } from "@/utils/cx";

type Filter = "all" | Channel;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "email", label: "Email" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "phone", label: "Calls" },
];

/** One history per supplier across every channel Zeke uses. POs go out by email, so they show under Email. */
export function SupplierHistory({ supplier }: { supplier: Supplier }) {
  const [filter, setFilter] = useState<Filter>("all");
  const items = supplier.history.filter((e) => filter === "all" || e.channel === filter || (filter === "email" && e.channel === "po"));

  return (
    <section className="flex min-w-0 flex-[999_1_480px] flex-col gap-3.5" aria-labelledby="history-title">
      <div className="flex flex-wrap items-center gap-1.5">
        <h2 id="history-title" className="me-2.5 text-headline-semibold">
          Everything Zeke and {supplier.name.split(" ")[0]} said
        </h2>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by channel">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
              className={cx(
                "h-8 rounded-full px-3 text-body-2-medium outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring",
                filter === key
                  ? "bg-text-primary text-text-white"
                  : "border border-border-button-default bg-background-primary-default hover:border-border-button-hover",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <ol className="rounded-3xl border border-border-button-default bg-background-primary-default px-5">
        {items.map((e, i) => {
          const Icon = channelIcon[e.channel];
          return (
            <li key={`${e.at}-${e.title}`} className={cx("flex gap-3.5 py-3.5", i > 0 && "border-t border-separator-border")}>
              <span
                className={cx(
                  "flex size-8.5 shrink-0 items-center justify-center rounded-xl",
                  e.channel === "phone" && "bg-accent-50 text-accent-700",
                  e.channel === "po" && "bg-text-primary text-text-white",
                  (e.channel === "email" || e.channel === "whatsapp") && "bg-background-secondary-default text-foreground-icon-primary",
                )}
              >
                <Icon className="size-4" aria-label={channelLabel[e.channel]} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-headline-regular">{e.title}</span>
                <span className="text-body-2-regular text-text-secondary">{e.meta}</span>
              </span>
              <span className="whitespace-nowrap font-mono text-body-2-regular text-text-tertiary">{longTime(e.at)}</span>
            </li>
          );
        })}
        {items.length === 0 ? <li className="py-8 text-center text-body-regular text-text-secondary">Nothing on this channel yet.</li> : null}
      </ol>
    </section>
  );
}
