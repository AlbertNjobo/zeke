import { call } from "eve/events";
import { defineHook } from "eve/hooks";
import { updateState } from "../lib/zeke/store";
import type { CharacterCue } from "../lib/zeke/types";

/** Every event writes a short-lived cue; the UI expires it after a few seconds. */
const EXPRESSIONS: Partial<Record<CharacterCue["state"], string>> = {
  idle: "attentif",
  thinking: "attentif",
  working: "attentif",
  waiting: "curieux",
  blocked: "mefiant",
  alert: "colere",
  notify: "attentif",
  celebrate: "heureux",
  curious: "curieux",
};

let last: { state: CharacterCue["state"]; at: number } | undefined;

async function cue(state: CharacterCue["state"], note?: string) {
  const now = Date.now();
  if (last?.state === state && now - last.at < 1200) return;
  last = { state, at: now };
  try {
    await updateState((s) => {
      s.character = { state, expression: EXPRESSIONS[state], at: new Date(now).toISOString(), note };
    });
  } catch (error) {
    console.error("[zeke] could not write character cue", error);
  }
}

/** Maps eve stream events to the mascot's state and expression. */
export default defineHook({
  events: {
    async "session.started"() {
      await cue("idle");
    },
    async "turn.started"() {
      await cue("thinking");
    },
    async "call.started"() {
      await cue("working");
    },
    async "call.settled"(event, ctx) {
      const data = event.data as { callId?: string; outcome?: string };
      const outcome = data.outcome ?? "";
      const observed = data.callId ? call(ctx.view, data.callId) : undefined;
      const name = String((observed as { name?: unknown } | undefined)?.name ?? "");
      if (outcome === "failed" || outcome === "rejected") await cue("alert", name || "tool failed");
      else if (/send_po|draft_po|compare_quotes/.test(name)) await cue("celebrate", name);
      else await cue("notify", name);
    },
    async "content.completed"(event) {
      const data = event.data as { phase?: string; kind?: string };
      if (data.phase === "reply" && data.kind === "text") await cue("idle");
    },
    async "interaction.opened"() {
      await cue("waiting");
    },
    async "interaction.settled"(event) {
      const data = event.data as { outcome?: string; response?: { decision?: string } };
      const decision = String(data.outcome ?? data.response?.decision ?? "");
      await cue(/approve|yes|allow/i.test(decision) ? "celebrate" : "alert", decision || "interaction settled");
    },
    async "turn.settled"(event) {
      const outcome = String((event.data as { outcome?: string }).outcome ?? "");
      if (outcome === "failed" || outcome === "cancelled") await cue("alert", outcome);
    },
  },
});
