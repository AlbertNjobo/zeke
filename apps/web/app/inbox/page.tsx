import { AgentChat } from "@/app/_components/agent-chat";
import { AppShell, PageHeader } from "@/components/zeke/app-shell";
import { InboxList } from "@/components/zeke/inbox-list";
import { InboxPane } from "@/components/zeke/inbox-pane";
import { RestockConversation } from "@/components/zeke/restock-conversation";
import { getState } from "@/lib/zeke/server";
import { inboxThreads } from "@/lib/zeke/inbox-views";
import { itemById } from "@/lib/zeke/views";

export const dynamic = "force-dynamic";

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ c?: string; q?: string }> }) {
  const { c, q } = await searchParams;
  const state = await getState();
  const list = await inboxThreads(state, q ?? "");
  const selected = list.find((thread) => thread.id === c) ?? list[0];
  const restock = selected?.kind === "restock" ? state.restocks.find((r) => r.id === selected.id) : undefined;
  const suppliers = restock ? state.suppliers.filter((s) => restock.supplierIds.includes(s.id) || s.id === restock.block?.supplierId) : [];

  return (
    <AppShell className="min-h-0">
      <PageHeader>
        <span className="text-headline-medium">Inbox</span>
        <span className="text-body-2-regular text-text-secondary">Everything Zeke is handling</span>
      </PageHeader>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="flex max-h-80 min-h-0 flex-col border-b border-separator-border md:max-h-none md:w-80 md:shrink-0 md:border-b-0 md:border-e">
          <InboxList threads={list} selectedId={selected?.id} query={q ?? ""} />
        </aside>

        <InboxPane>
          {selected?.kind === "chat" ? (
            <AgentChat sessionId={selected.id} />
          ) : restock ? (
            <RestockConversation restock={restock} item={itemById(state, restock.itemId)} suppliers={suppliers} company={state.company} />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center">
              <div className="flex flex-col gap-2">
                <span className="text-headline-medium">Nothing selected</span>
                <span className="text-body-regular text-text-secondary">Choose a conversation from the list.</span>
              </div>
            </div>
          )}
        </InboxPane>
      </div>
    </AppShell>
  );
}
