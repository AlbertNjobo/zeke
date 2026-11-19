import Link from "next/link";
import { AppShell } from "@/components/zeke/app-shell";
import { ThreadList } from "@/components/zeke/thread-list";
import { chatSessions } from "@/lib/zeke/chat-sessions";
import { getState } from "@/lib/zeke/server";
import { longTime, threads } from "@/lib/zeke/views";

export const dynamic = "force-dynamic";

export default async function ConversationsPage() {
  const [state, chats] = await Promise.all([getState(), chatSessions()]);
  return (
    <AppShell>
      <div className="flex w-full max-w-270 flex-col gap-5 px-5 py-7 md:px-10">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-display-4-semibold tracking-tight">Conversations</h1>
          <span className="text-body-regular text-text-secondary">Chats with Zeke and one thread per restock</span>
        </div>

        <section className="flex flex-col gap-2.5" aria-label="Chats with Zeke">
          <h2 className="text-body-semibold">Zeke chats</h2>
          {chats.length === 0 ? (
            <p className="rounded-3xl border border-border-button-default bg-background-primary-default p-4.5 text-body-regular text-text-secondary">
              No chats saved yet. Ask Zeke something on the home page and it will appear here.
            </p>
          ) : (
            <ul className="overflow-hidden rounded-3xl border border-border-button-default bg-background-primary-default">
              {chats.map((chat, i) => (
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
        </section>

        <section className="flex flex-col gap-2.5" aria-label="Restock threads">
          <h2 className="text-body-semibold">Restock threads</h2>
          <ThreadList threads={threads(state)} />
        </section>
      </div>
    </AppShell>
  );
}
