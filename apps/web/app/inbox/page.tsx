import { AppShell, PageHeader } from "@/components/zeke/app-shell";
import { EmailList } from "@/components/zeke/email-list";
import { EmailThreadView } from "@/components/zeke/email-thread-view";
import { InboxPane } from "@/components/zeke/inbox-pane";
import { emailThreads } from "@/lib/zeke/email-views";
import { getState } from "@/lib/zeke/server";

export const dynamic = "force-dynamic";

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ t?: string; q?: string }> }) {
  const { t, q } = await searchParams;
  const state = await getState();
  const needle = (q ?? "").trim().toLowerCase();
  const threads = emailThreads(state).filter(
    (thread) =>
      !needle ||
      `${thread.title} ${thread.subject} ${thread.preview} ${thread.messages.map((m) => m.body).join(" ")}`.toLowerCase().includes(needle),
  );
  const selected = threads.find((thread) => thread.key === t) ?? threads[0];

  return (
    <AppShell className="min-h-0">
      <PageHeader>
        <span className="text-headline-medium">Email inbox</span>
        <span className="text-body-2-regular text-text-secondary">Zeke&apos;s mailbox</span>
      </PageHeader>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="flex max-h-96 min-h-0 flex-col border-b border-separator-border md:max-h-none md:w-92 md:shrink-0 md:border-b-0 md:border-e">
          <EmailList threads={threads} selectedKey={selected?.key} query={q ?? ""} />
        </aside>

        <InboxPane>
          {selected ? (
            <EmailThreadView thread={selected} />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center">
              <div className="flex flex-col gap-2">
                <span className="text-headline-medium">No conversations</span>
                <span className="text-body-regular text-text-secondary">Supplier replies and Zeke&apos;s RFQs will appear here.</span>
              </div>
            </div>
          )}
        </InboxPane>
      </div>
    </AppShell>
  );
}
