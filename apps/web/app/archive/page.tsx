import Link from "next/link";
import { AppShell, PageHeader } from "@/components/zeke/app-shell";
import { chatSessions } from "@/lib/zeke/chat-sessions";
import { longTime } from "@/lib/zeke/views";

export const dynamic = "force-dynamic";

export default async function ArchivePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();
  const all = await chatSessions();
  const archives = query ? all.filter((chat) => chat.title.toLowerCase().includes(query)) : all;

  return (
    <AppShell>
      <PageHeader>
        <span className="text-headline-medium">Archive</span>
      </PageHeader>

      <div className="flex w-full max-w-270 flex-col gap-5 px-5 py-7 md:px-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-display-4-semibold tracking-tight">Chat archive</h1>
          <p className="text-body-regular text-text-secondary">Every conversation, saved in Neon. Search by the first thing you asked Zeke.</p>
        </div>

        <search>
          <form action="/archive" method="GET" className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="archive-query" className="text-body-medium">Search conversations</label>
              <input
                type="search"
                id="archive-query"
                name="q"
                defaultValue={q ?? ""}
                autoComplete="off"
                spellCheck={false}
                placeholder="gloves, quotes, delivery…"
                className="min-h-11 rounded-xl border border-border-button-default bg-background-primary-default px-3.5 py-2.5 text-body-regular text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
              />
            </div>
            <button
              type="submit"
              className="min-h-11 rounded-xl border border-border-button-default bg-background-secondary-default px-4 text-body-medium outline-none hover:border-border-button-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring"
            >
              Search
            </button>
          </form>
        </search>

        <p role="status" className="text-body-2-regular text-text-secondary">
          {archives.length} conversation{archives.length === 1 ? "" : "s"}{query ? ` matching “${q}”` : ""}
        </p>

        {archives.length === 0 ? (
          <p className="rounded-3xl border border-border-button-default bg-background-primary-default p-4.5 text-body-regular text-text-secondary">
            No saved conversations yet. Chat messages appear here as soon as Zeke replies.
          </p>
        ) : (
          <ul className="flex flex-col overflow-hidden rounded-3xl border border-border-button-default bg-background-primary-default">
            {archives.map((chat, i) => (
              <li key={chat.sessionId} className={i > 0 ? "border-t border-separator-border" : undefined}>
                <Link
                  href={`/s/${chat.sessionId}`}
                  className="flex flex-col gap-1 px-5 py-4 outline-none hover:bg-background-primary-hover focus-visible:bg-background-primary-hover"
                >
                  <span className="text-headline-medium">{chat.title}</span>
                  <span className="font-mono text-caption-1-regular text-text-tertiary">
                    {longTime(chat.at)} · {chat.messageCount} messages
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
