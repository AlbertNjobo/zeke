"use client";

import Link from "next/link";
import { useState } from "react";
import { channelLabel } from "@/components/zeke/channel";
import { ZekeFace } from "@/components/zeke/zeke-face";
import { shortTime, type ThreadStatus, type ThreadView as Thread } from "@/lib/zeke/views";
import { cx } from "@/utils/cx";

const STATUS: Record<ThreadStatus, { label: string; pill: string }> = {
  "needs-you": { label: "Needs you", pill: "bg-accent-50 text-accent-700" },
  working: { label: "Working", pill: "bg-background-secondary-default text-text-secondary" },
  blocked: { label: "Blocked", pill: "bg-background-tertiary-default text-text-primary" },
  done: { label: "Done", pill: "bg-state-success-base text-state-success-text" },
};

const FILTERS: { key: "all" | ThreadStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "needs-you", label: "Needs you" },
  { key: "working", label: "Working" },
  { key: "blocked", label: "Blocked" },
  { key: "done", label: "Done" },
];

export function ThreadList({ threads }: { threads: Thread[] }) {
  const [filter, setFilter] = useState<"all" | ThreadStatus>("all");
  const shown = threads.filter((t) => filter === "all" || t.status === filter);

  return (
    <>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter conversations">
        {FILTERS.map(({ key, label }) => {
          const on = filter === key;
          const count = key === "all" ? threads.length : threads.filter((t) => t.status === key).length;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(key)}
              className={cx(
                "flex h-9 items-center gap-2 rounded-full px-3.5 text-body-medium outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring",
                on
                  ? "bg-text-primary text-text-white"
                  : "border border-border-button-default bg-background-primary-default text-text-primary hover:border-border-button-hover",
              )}
            >
              {label}
              <span className="font-mono text-caption-1-regular opacity-75">{count}</span>
            </button>
          );
        })}
      </div>

      <ul className="overflow-hidden rounded-3xl border border-border-button-default bg-background-primary-default">
        {shown.map((t, i) => {
          const status = STATUS[t.status];
          const href = `/conversations/${t.id}`;
          const body = (
            <>
              <ZekeFace state={t.face} size={34} hole="var(--color-background-primary-default)" decorative />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-headline-medium">{t.title}</span>
                <span className="truncate text-body-regular text-text-secondary">{t.line}</span>
              </span>
              <span className="hidden text-caption-1-regular text-text-secondary lg:block">
                {t.channels.map((c) => channelLabel[c]).join(" · ")}
              </span>
              <span className={cx("whitespace-nowrap rounded-full px-2.5 py-1 text-caption-1-medium", status.pill)}>{status.label}</span>
              <span className="w-12 text-end font-mono text-body-2-regular text-text-tertiary">{shortTime(t.at)}</span>
            </>
          );
          return (
            <li key={t.id} className={i > 0 ? "border-t border-separator-border" : undefined}>
              {href ? (
                <Link
                  href={href}
                  className="flex items-center gap-4 px-5 py-4 outline-none hover:bg-background-primary-hover focus-visible:bg-background-primary-hover"
                >
                  {body}
                </Link>
              ) : (
                <div className="flex items-center gap-4 px-5 py-4">{body}</div>
              )}
            </li>
          );
        })}
        {shown.length === 0 ? (
          <li className="px-5 py-10 text-center text-body-regular text-text-secondary">Nothing here right now. Zeke will add it when it comes up.</li>
        ) : null}
      </ul>
    </>
  );
}
