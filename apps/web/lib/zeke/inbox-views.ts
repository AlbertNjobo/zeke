import type { ZekeState } from "@zeke/types";
import { chatSessions } from "./chat-sessions";
import { threads, type ThreadView, type ZekeMood } from "./views";

export interface InboxThread {
  id: string;
  kind: "restock" | "chat";
  title: string;
  line: string;
  at: string;
  face: ZekeMood;
  status: ThreadView["status"] | "chat";
}

export async function inboxThreads(state: ZekeState, query = ""): Promise<InboxThread[]> {
  const q = query.trim().toLowerCase();
  const restocks: InboxThread[] = threads(state).map((t) => ({
    id: t.id,
    kind: "restock",
    title: t.title,
    line: t.line,
    at: t.at,
    face: t.face,
    status: t.status,
  }));
  const chats: InboxThread[] = (await chatSessions()).map((c) => ({
    id: c.sessionId,
    kind: "chat",
    title: c.title,
    line: `${c.messageCount} message${c.messageCount === 1 ? "" : "s"} · Zeke chat`,
    at: c.at,
    face: "idle",
    status: "chat",
  }));
  return [...restocks, ...chats]
    .filter((t) => !q || `${t.title} ${t.line}`.toLowerCase().includes(q))
    .sort((a, b) => b.at.localeCompare(a.at));
}
