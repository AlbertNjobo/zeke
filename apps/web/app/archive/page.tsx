import { transcriptOf } from "eve/client";
import Link from "next/link";
import { AppShell, PageHeader } from "@/components/zeke/app-shell";
import { readTranscriptEvents } from "@zeke/transcript-store";
import { longTime } from "@/lib/zeke/views";

export const dynamic = "force-dynamic";

export default async function ArchivePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();

  const rows = await readTranscriptEvents();
  const bySession = new Map<string, typeof rows>();
  for (const row of rows) {
    const list = bySession.get(row.sessionId) ?? [];
    list.push(row);
    bySession.set(row.sessionId, list);
  }

  const archives = [...bySession]
    .map(([sessionId, events]) => {
      const messages = transcriptOf(events.map((row) => row.event) as never[]).messages;
      return { sessionId, messages, at: events.at(-1)?.at ?? new Date(0).toISOString() };
    })
    .filter((archive) => !query || archive.messages.some((message) => message.text.toLowerCase().includes(query)))
    .sort((a, b) => b.at.localeCompare(a.at));

  return (
    <AppShell>
      <PageHeader>
        <span className="text-headline-medium">Archive</span>
      </PageHeader>

      <div className="flex w-full max-w-270 flex-col gap-5 px-5 py-7 md:px-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-display-4-semibold tracking-tight">Chat archive</h1>
          <p className="text-body-regular text-text-secondary">Every conversation, saved in Neon. Search by anything Zeke or the buyer said.</p>
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
                placeholder="gloves, quote, delivery…"
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
            No saved conversations yet. Chat messages will appear here as soon as Zeke replies.
          </p>
        ) : (
          <ol className="flex flex-col gap-4">
            {archives.map((archive) => (
              <li key={archive.sessionId} className="flex flex-col gap-3 rounded-3xl border border-border-button-default bg-background-primary-default p-4.5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="text-headline-medium">Conversation</h2>
                  <span className="font-mono text-caption-1-regular text-text-tertiary">{longTime(archive.at)}</span>
                  <Link
                    href={`/s/${archive.sessionId}`}
                    className="text-body-2-regular text-accent-700 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-border-focus-ring"
                  >
                    Open live chat
                  </Link>
                </div>
                <ol className="flex flex-col gap-2">
                  {archive.messages.map((message, index) => (
                    <li key={index} className="flex flex-col gap-0.5">
                      <span className="text-caption-1-medium uppercase text-text-secondary">{message.role}</span>
                      <p dir="auto" className="whitespace-pre-wrap text-body-regular">{message.text}</p>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        )}
      </div>
    </AppShell>
  );
}
