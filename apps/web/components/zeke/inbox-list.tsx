"use client";

import Link from "next/link";
import { useState } from "react";
import { ScrollFade, useScrollFade } from "@/components/foundations/scroll-fade/scroll-fade";
import { ZekeFace } from "@/components/zeke/zeke-face";
import type { InboxThread } from "@/lib/zeke/inbox-views";
import { shortTime } from "@/lib/zeke/views";
import { cx } from "@/utils/cx";

type Filter = "all" | "needs-you" | "chat";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "needs-you", label: "Needs you" },
  { key: "chat", label: "Chats" },
];

export function InboxList({ threads, selectedId, query }: { threads: InboxThread[]; selectedId?: string; query: string }) {
  const [filter, setFilter] = useState<Filter>("all");
  const fade = useScrollFade();
  const shown = threads.filter((t) => filter === "all" || (filter === "chat" ? t.kind === "chat" : t.status === "needs-you"));

  return (
    <div className="flex h-full min-h-0 flex-col bg-background-primary-default">
      <div className="flex flex-col gap-3 border-b border-separator-border p-4">
        <search>
          <form action="/inbox" method="GET" className="flex flex-col gap-1">
            <label htmlFor="inbox-search" className="text-caption-1-semibold text-text-secondary">Search</label>
            <input
              type="search"
              id="inbox-search"
              name="q"
              defaultValue={query}
              autoComplete="off"
              spellCheck={false}
              placeholder="Search messages…"
              className="min-h-10 rounded-xl border border-border-button-default bg-background-secondary-default px-3 text-body-regular text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
            />
          </form>
        </search>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter inbox">
          {FILTERS.map(({ key, label }) => {
            const on = filter === key;
            const count = key === "all" ? threads.length : threads.filter((t) => (key === "chat" ? t.kind === "chat" : t.status === "needs-you")).length;
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
          {shown.map((t, i) => {
            const selected = t.id === selectedId;
            return (
              <li key={`${t.kind}-${t.id}`} className={cx(i > 0 && "border-t border-separator-border", selected && "bg-accent-50")}>
                <Link
                  href={`/inbox?c=${encodeURIComponent(t.id)}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  aria-current={selected ? "page" : undefined}
                  className="flex items-start gap-3 px-4 py-3.5 outline-none hover:bg-background-primary-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus-ring"
                >
                  {t.kind === "restock" ? (
                    <ZekeFace state={t.face} size={30} decorative />
                  ) : (
                    <span className="flex size-7.5 shrink-0 items-center justify-center rounded-xl bg-background-secondary-default text-caption-1-semibold text-text-secondary">Z</span>
                  )}
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-baseline gap-2">
                      <span className="truncate text-body-medium">{t.title}</span>
                      {t.status === "needs-you" ? <span className="size-1.5 shrink-0 rounded-full bg-accent-500" aria-label="Needs you" /> : null}
                    </span>
                    <span className="truncate text-body-2-regular text-text-secondary">{t.line}</span>
                  </span>
                  <span className="whitespace-nowrap font-mono text-caption-1-regular text-text-tertiary">{shortTime(t.at)}</span>
                </Link>
              </li>
            );
          })}
          {shown.length === 0 ? (
            <li className="px-4 py-10 text-center text-body-regular text-text-secondary">Nothing matches this filter.</li>
          ) : null}
        </ul>
        <ScrollFade progress={fade.progress} />
      </div>
    </div>
  );
}
