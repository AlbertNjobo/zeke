import { transcriptOf } from "eve/client";
import { readTranscriptEvents } from "@zeke/transcript-store";

export interface ChatSessionView {
  sessionId: string;
  title: string;
  at: string;
  messageCount: number;
}

/** Saved eve conversations, newest first, with the first buyer message as the title. */
export async function chatSessions(): Promise<ChatSessionView[]> {
  const rows = await readTranscriptEvents();
  const grouped = new Map<string, typeof rows>();
  for (const row of rows) {
    const list = grouped.get(row.sessionId) ?? [];
    list.push(row);
    grouped.set(row.sessionId, list);
  }
  return [...grouped]
    .map(([sessionId, events]) => {
      const messages = transcriptOf(events.map((row) => row.event) as never[]).messages;
      const first = messages.find((message) => message.role === "user")?.text ?? "New chat";
      return {
        sessionId,
        title: first.length > 90 ? `${first.slice(0, 87)}…` : first,
        at: events.at(-1)?.at ?? new Date(0).toISOString(),
        messageCount: messages.length,
      };
    })
    .sort((a, b) => b.at.localeCompare(a.at));
}
