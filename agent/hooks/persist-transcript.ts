import { defineHook } from "eve/hooks";
import { appendTranscriptEvent, ensureTranscriptTable } from "../lib/zeke/transcript-store";

let ready: Promise<void> | undefined;

/** Mirror eve's session stream into Neon so chat history outlives eve's own retention. */
export default defineHook({
  events: {
    async "*"(event, ctx) {
      try {
        ready ??= ensureTranscriptTable();
        await ready;
        await appendTranscriptEvent({
          sessionId: ctx.session.id,
          line: ctx.position.line,
          index: ctx.position.index,
          type: event.type,
          data: (event as { data?: unknown }).data ?? null,
          at: ctx.now.toISOString(),
        });
      } catch (error) {
        // A storage failure must never break the buyer's conversation.
        console.error("[zeke] could not persist transcript event", error);
      }
    },
  },
});
