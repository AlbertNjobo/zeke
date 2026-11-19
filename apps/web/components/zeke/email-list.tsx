"use client";

import Link from "next/link";
import { useState } from "react";
import { ScrollFade, useScrollFade } from "@/components/foundations/scroll-fade/scroll-fade";
import type { EmailView } from "@/lib/zeke/email-views";
import { shortTime } from "@/lib/zeke/views";
import { cx } from "@/utils/cx";

type Filter = "all" | "unread" | "sent";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "sent", label: "Sent" },
];

export function EmailList({ messages, selectedId, query }: { messages: EmailView[]; selectedId?: string; query: string }) {
  const [filter, setFilter] = useState<Filter>("all");
  const fade = useScrollFade();
  const shown = messages.filter((m) => filter === "all" || (filter === "unread" ? !m.read && m.direction === "in" : m.direction === "out"));

  return (
    <div className="flex h-full min-h-0 flex-col bg-background-primary-default">
      <div className="flex flex-col gap-3 border-b border-separator-border p-4">
        <search>
          <form action="/inbox" method="GET" className="flex flex-col gap-1">
            <label htmlFor="mail-search" className="text-caption-1-semibold text-text-secondary">Search mail</label>
            <input
              type="search"
              id="mail-search"
              name="q"
              defaultValue={query}
              autoComplete="off"
              spellCheck={false}
              placeholder="Supplier, subject, words…"
              className="min-h-10 rounded-xl border border-border-button-default bg-background-secondary-default px-3 text-body-regular text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
            />
          </form>
        </search>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter email">
          {FILTERS.map(({ key, label }) => {
            const on = filter === key;
            const count = key === "all" ? messages.length : messages.filter((m) => (key === "unread" ? !m.read && m.direction === "in" : m.direction === "out")).length;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(key)}
                className={cx(
                  "flex h-8 items-center gap-1.5 rounded-full px-3 text-body-2-medium outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring",
                  on ? "bg-text-primary text-text-white" : "border border-border-button-default text-text-secondary hover:border-border-button-hover",
                )}
              >
                {label}
                <span className="font-mono opacity-75">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <ul onScroll={fade.onScroll} className="h-full overflow-y-auto">
          {shown.map((m, i) => {
            const selected = m.id === selectedId;
            return (
              <li key={m.id} className={cx(i > 0 && "border-t border-separator-border", selected && "bg-accent-50")}>
                <Link
                  href={`/inbox?m=${encodeURIComponent(m.id)}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  aria-current={selected ? "page" : undefined}
                  className="flex flex-col gap-1 px-4 py-3.5 outline-none hover:bg-background-primary-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus-ring"
                >
                  <span className="flex items-baseline gap-2">
                    <span className={cx("min-w-0 flex-1 truncate", !m.read && m.direction === "in" ? "text-body-semibold" : "text-body-medium")}>
                      {m.direction === "in" ? m.from : `To: ${m.to}`}
                    </span>
                    {!m.read && m.direction === "in" ? <span className="size-1.5 shrink-0 rounded-full bg-accent-500" aria-label="Unread" /> : null}
                    <span className="whitespace-nowrap font-mono text-caption-1-regular text-text-tertiary">{shortTime(m.at)}</span>
                  </span>
                  <span className="truncate text-body-2-medium">{m.subject}</span>
                  <span className="truncate text-body-2-regular text-text-secondary">{m.preview}</span>
                  {m.attachment ? <span className="text-caption-1-regular text-accent-700">Attachment: {m.attachment}</span> : null}
                </Link>
              </li>
            );
          })}
          {shown.length === 0 ? (
            <li className="px-4 py-10 text-center text-body-regular text-text-secondary">No mail in this view.</li>
          ) : null}
        </ul>
        <ScrollFade progress={fade.progress} />
      </div>
    </div>
  );
}
