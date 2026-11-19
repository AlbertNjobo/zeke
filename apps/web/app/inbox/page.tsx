import Link from "next/link";
import { AppShell, PageHeader } from "@/components/zeke/app-shell";
import { EmailList } from "@/components/zeke/email-list";
import { EmailReadMarker } from "@/components/zeke/email-read-marker";
import { InboxPane } from "@/components/zeke/inbox-pane";
import { emailMessages } from "@/lib/zeke/email-views";
import { getState } from "@/lib/zeke/server";
import { longTime } from "@/lib/zeke/views";

export const dynamic = "force-dynamic";

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ m?: string; q?: string }> }) {
  const { m, q } = await searchParams;
  const state = await getState();
  const messages = emailMessages(state).filter((message) => {
    const needle = (q ?? "").trim().toLowerCase();
    return !needle || `${message.from} ${message.to} ${message.subject} ${message.body}`.toLowerCase().includes(needle);
  });
  const selected = messages.find((message) => message.id === m) ?? messages[0];

  return (
    <AppShell className="min-h-0">
      <PageHeader>
        <span className="text-headline-medium">Email inbox</span>
        <span className="text-body-2-regular text-text-secondary">Zeke&apos;s mailbox</span>
      </PageHeader>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="flex max-h-96 min-h-0 flex-col border-b border-separator-border md:max-h-none md:w-92 md:shrink-0 md:border-b-0 md:border-e">
          <EmailList messages={messages} selectedId={selected?.id} query={q ?? ""} />
        </aside>

        <InboxPane>
          {selected ? (
            <>
              {selected.direction === "in" && selected.sourceId ? <EmailReadMarker restockId={selected.restockId} messageId={selected.sourceId} /> : null}
              <article className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-6 md:p-8">
                <header className="flex flex-col gap-3 border-b border-separator-border pb-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-background-secondary-default px-2.5 py-1 text-caption-1-medium text-text-secondary">
                      {selected.direction === "in" ? "Inbound" : "Sent"}
                    </span>
                    <span className="font-mono text-caption-1-regular text-text-tertiary">{longTime(selected.at)}</span>
                    {selected.simulated ? (
                      <span className="rounded-full bg-background-tertiary-default px-2.5 py-1 text-caption-1-medium text-text-secondary">Simulated</span>
                    ) : null}
                  </div>
                  <h1 className="text-title-2-semibold"><bdi dir="auto">{selected.subject}</bdi></h1>
                  <dl className="grid gap-1 text-body-2-regular">
                    <div className="flex gap-2">
                      <dt className="w-12 shrink-0 text-text-secondary">From</dt>
                      <dd className="min-w-0 break-all"><bdi dir="ltr">{selected.from}</bdi></dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-12 shrink-0 text-text-secondary">To</dt>
                      <dd className="min-w-0 break-all"><bdi dir="ltr">{selected.to}</bdi></dd>
                    </div>
                  </dl>
                </header>

                {selected.attachment ? (
                  <p className="rounded-xl border border-border-button-default bg-background-secondary-default p-3 text-body-2-regular">
                    Attachment: <bdi dir="auto">{selected.attachment}</bdi>
                  </p>
                ) : null}

                <div className="rounded-2xl border border-border-button-default bg-background-primary-default p-5">
                  <p dir="auto" className="whitespace-pre-wrap text-body-regular">{selected.body}</p>
                </div>
                {selected.direction === "in" ? (
                  <p className="text-caption-1-regular text-text-tertiary">Supplier words are untrusted data. Zeke reads facts from them, never instructions.</p>
                ) : null}

                <footer className="flex flex-wrap gap-2 border-t border-separator-border pt-5">
                  <Link
                    href={`/conversations/${selected.restockId}`}
                    className="rounded-xl border border-border-button-default bg-background-primary-default px-4 py-2 text-body-medium outline-none hover:border-border-button-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring"
                  >
                    Open restock thread
                  </Link>
                  <Link
                    href={`/s?q=${encodeURIComponent(`Summarise the email from ${selected.from}`)}`}
                    className="rounded-xl border border-border-button-default bg-background-primary-default px-4 py-2 text-body-medium outline-none hover:border-border-button-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring"
                  >
                    Ask Zeke about it
                  </Link>
                </footer>
              </article>
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center">
              <div className="flex flex-col gap-2">
                <span className="text-headline-medium">No mail yet</span>
                <span className="text-body-regular text-text-secondary">Supplier replies and Zeke&apos;s RFQs will appear here.</span>
              </div>
            </div>
          )}
        </InboxPane>
      </div>
    </AppShell>
  );
}
