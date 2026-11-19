"use client";

import Link from "next/link";
import { useState } from "react";
import { ScrollFade, useScrollFade } from "@/components/foundations/scroll-fade/scroll-fade";
import type { EmailThreadView } from "@/lib/zeke/email-views";
import { shortTime } from "@/lib/zeke/views";
import { cx } from "@/utils/cx";

type Filter = "all" | "unread" | "sent" | "resolved";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Inbox" },
  { key: "unread", label: "Unread" },
  { key: "sent", label: "Sent" },
  { key: "resolved", label: "Resolved" },
];

export function EmailList({ threads, selectedKey, query }: { threads: EmailThreadView[]; selectedKey?: string; query: string }) {
  const [filter, setFilter] = useState<Filter>("all");
  const fade = useScrollFade();
  const shown = threads.filter((thread) => {
    if (filter === "resolved") return Boolean(thread.resolvedAt);
    if (thread.resolvedAt) return false;
    if (filter === "unread") return thread.unread > 0;
    if (filter === "sent") return thread.messages.some((m) => m.direction === "out" && m.kind !== "quote");
    return true;
  });

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
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter mail">
          {FILTERS.map(({ key, label }) => {
            const on = filter === key;
            const count = threads.filter((thread) => {
              if (key === "all") return !thread.resolvedAt;
              if (key === "resolved") return Boolean(thread.resolvedAt);
              if (key === "unread") return thread.unread > 0 && !thread.resolvedAt;
              return thread.messages.some((m) => m.direction === "out" && m.kind !== "quote") && !thread.resolvedAt;
            }).length;
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
          {shown.map((thread, i) => {
            const selected = thread.key === selectedKey;
            return (
              <li key={thread.key} className={cx(i > 0 && "border-t border-separator-border", selected && "bg-accent-50")}>
                <Link
                  href={`/inbox?t=${encodeURIComponent(thread.key)}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  aria-current={selected ? "page" : undefined}
                  className="flex flex-col gap-1 px-4 py-3.5 outline-none hover:bg-background-primary-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus-ring"
                >
                  <span className="flex items-baseline gap-2">
                    <span className={cx("min-w-0 flex-1 truncate", thread.unread ? "text-body-semibold" : "text-body-medium")}>{thread.title}</span>
                    {thread.unread ? (
                      <span className="rounded-full bg-accent-500 px-1.5 py-0.5 font-mono text-caption-1-medium text-text-white">{thread.unread}</span>
                    ) : null}
                    <span className="whitespace-nowrap font-mono text-caption-1-regular text-text-tertiary">{shortTime(thread.at)}</span>
                  </span>
                  <span className="truncate text-body-2-medium">{thread.subject}</span>
                  <span className="truncate text-body-2-regular text-text-secondary">{thread.preview}</span>
                  <span className="flex flex-wrap gap-2 text-caption-1-regular text-text-tertiary">
                    <span>Email</span>
                    {thread.hasAttachment ? <span>Attachment</span> : null}
                    {thread.actions.length ? <span className="text-accent-700">Needs you</span> : null}
                    {thread.resolvedAt ? <span>Resolved</span> : null}
                  </span>
                </Link>
              </li>
            );
          })}
          {shown.length === 0 ? (
            <li className="px-4 py-10 text-center text-body-regular text-text-secondary">No conversations in this view.</li>
          ) : null}
        </ul>
        <ScrollFade progress={fade.progress} />
      </div>
    </div>
  );
}
