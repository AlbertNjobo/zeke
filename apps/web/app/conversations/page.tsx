import { AppShell } from "@/components/zeke/app-shell";
import { ThreadList } from "@/components/zeke/thread-list";
import { getState } from "@/lib/zeke/server";
import { threads } from "@/lib/zeke/views";

export const dynamic = "force-dynamic";

export default async function ConversationsPage() {
  const state = await getState();
  return (
    <AppShell>
      <div className="flex w-full max-w-270 flex-col gap-5 px-5 py-7 md:px-10">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-display-4-semibold tracking-tight">Conversations</h1>
          <span className="text-body-regular text-text-secondary">One per restock</span>
        </div>
        <ThreadList threads={threads(state)} />
      </div>
    </AppShell>
  );
}
