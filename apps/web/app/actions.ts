"use server";

import { revalidatePath } from "next/cache";
import { nowIso, restockById } from "@zeke/logic";
import { readState, resetState, updateState } from "@zeke/store";
import { tellZeke, type TellResult } from "@/lib/zeke/agent-client";
import { demoReplies } from "@/lib/zeke/demo-replies";

/**
 * Everything the buyer decides in the app. Each action records the decision first, then tells
 * Zeke in the restock's own session. Zeke's sending tools check these records, so a decision made
 * here is what lets Zeke act, never the message alone.
 */

function refresh() {
  revalidatePath("/", "layout");
}

export async function approveRestock(restockId: string): Promise<TellResult> {
  await updateState((s) => {
    const r = restockById(s, restockId);
    if (!r || r.status !== "proposed") throw new Error("This proposal isn't waiting for approval any more.");
    const at = nowIso();
    r.status = "approved";
    r.approvedAt = at;
    r.timeline.push({ at, text: `You approved asking for quotes on ${r.quantity}` });
  });
  refresh();
  return tellZeke(restockId, `[App] The buyer approved restock ${restockId}. Ask the suppliers for quotes now.`);
}

export async function skipRestock(restockId: string): Promise<TellResult> {
  await updateState((s) => {
    const r = restockById(s, restockId);
    if (!r || r.status !== "proposed") throw new Error("This proposal isn't waiting for approval any more.");
    const at = nowIso();
    r.status = "skipped";
    r.timeline.push({ at, text: "You skipped this restock. Nothing was sent." });
  });
  refresh();
  return tellZeke(restockId, `[App] The buyer skipped restock ${restockId}. Don't contact anyone about it.`);
}

export async function approvePo(restockId: string): Promise<TellResult> {
  const poNumber = await updateState((s) => {
    const r = restockById(s, restockId);
    if (!r?.po || r.status !== "po-review" || (r.po.status !== "draft" && r.po.status !== "held")) {
      throw new Error("This purchase order isn't waiting for approval any more.");
    }
    const at = nowIso();
    r.po.status = "approved";
    r.po.approvedAt = at;
    r.timeline.push({ at, text: `You approved ${r.po.number}` });
    return r.po.number;
  });
  refresh();
  return tellZeke(restockId, `[App] The buyer approved PO ${poNumber} on restock ${restockId}. Send it.`);
}

export async function holdPo(restockId: string): Promise<TellResult> {
  const poNumber = await updateState((s) => {
    const r = restockById(s, restockId);
    if (!r?.po || r.po.status !== "draft") throw new Error("This purchase order isn't a draft any more.");
    const at = nowIso();
    r.po.status = "held";
    r.timeline.push({ at, text: `You held ${r.po.number}. Nothing was sent.` });
    return r.po.number;
  });
  refresh();
  return tellZeke(restockId, `[App] The buyer held PO ${poNumber} on restock ${restockId}. Don't send it.`);
}

export async function answerQuestion(restockId: string, questionId: string, answer: string): Promise<TellResult> {
  const question = await updateState((s) => {
    const q = restockById(s, restockId)?.questions.find((x) => x.id === questionId);
    if (!q || q.answer !== undefined) throw new Error("This question was already answered.");
    q.answer = answer;
    q.answeredAt = nowIso();
    return q.text;
  });
  refresh();
  return tellZeke(restockId, `[App] On restock ${restockId}, the buyer answered "${question}": ${answer}.`);
}

/** The buyer's choice when Zeke stopped at the spend limit. */
export async function resolveBlock(restockId: string, choice: string): Promise<TellResult> {
  await updateState((s) => {
    const r = restockById(s, restockId);
    if (!r || r.status !== "blocked") throw new Error("This restock isn't blocked any more.");
    r.timeline.push({ at: nowIso(), text: `You chose: ${choice}` });
  });
  refresh();
  return tellZeke(restockId, `[App] On restock ${restockId}, which is over the spend limit, the buyer chose: ${choice}.`);
}

/** Demo only: deliver stand-in supplier replies to Zeke as if they arrived on its channels. */
export async function deliverDemoReplies(restockId: string): Promise<TellResult> {
  const state = await readState();
  const r = restockById(state, restockId);
  if (!r || r.status !== "collecting") return { ok: false, error: "Replies only arrive while Zeke is collecting quotes." };
  const text = demoReplies(state, r);
  if (!text) return { ok: false, error: "Every supplier has already replied." };
  return tellZeke(restockId, `Supplier replies for restock ${restockId}:\n\n${text}`);
}

export async function runStockCheck(): Promise<TellResult> {
  const result = await tellZeke(null, "[App] The buyer asked for a stock check now. Check stock and propose restocks for low items.");
  refresh();
  return result;
}

export async function resetDemo() {
  await resetState();
  refresh();
}
