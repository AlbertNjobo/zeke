"use client";

import { RiChat3Line, RiInboxArchiveLine } from "@remixicon/react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { approvePo, approveRestock, answerQuestion, deliverDemoReplies, holdPo, resolveBlock, skipRestock } from "@/app/actions";
import { Button } from "@/components/base/buttons/button";
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerTrigger } from "@/components/base/drawer/drawer";
import { channelLabel } from "@/components/zeke/channel";
import { ConversationColumn, ConversationHeader, EventLine, Indented, LetteredOptions, ZekeSays } from "@/components/zeke/conversation-parts";
import { PurchaseOrderView, QuoteTable } from "@/components/zeke/restock-parts";
import {
  formatMoney,
  longTime,
  openQuestions,
  poTotals,
  shortTime,
  type Company,
  type Restock,
  type StockItem,
  type Supplier,
} from "@/lib/zeke/views";

interface Props {
  restock: Restock;
  item?: StockItem;
  suppliers: Supplier[];
  company: Company;
}

export function RestockConversation({ restock: r, item, suppliers, company }: Props) {
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string }>();
  const supplierName = (id: string) => suppliers.find((s) => s.id === id)?.name ?? id;
  const unit = item?.unit ?? "units";
  const questions = openQuestions(r);
  const waitingOn = r.supplierIds.filter((id) => !r.quotes.some((q) => q.supplierId === id));
  const poSupplier = r.po ? suppliers.find((s) => s.id === r.po?.supplierId) : undefined;
  const poTotal = r.po ? poTotals(r.po, company.vatRate).total : 0;

  function run(action: () => Promise<{ ok: boolean; error?: string }>, okText?: string) {
    setNotice(undefined);
    startTransition(async () => {
      try {
        const result = await action();
        if (!result.ok) setNotice({ tone: "error", text: result.error ?? "Zeke didn't get that." });
        else if (okText) setNotice({ tone: "ok", text: okText });
      } catch (error) {
        setNotice({ tone: "error", text: error instanceof Error ? error.message : "That didn't work. Try again." });
      }
    });
  }

  return (
    <>
      <ConversationHeader
        title={`Restock · ${item?.name ?? r.itemId}`}
        aside={
          r.sessionId ? (
            <Link
              href={`/s/${r.sessionId}`}
              className="flex h-9 items-center gap-2 rounded-xl border border-border-button-default bg-background-primary-default px-3 text-body-2-medium outline-none hover:border-border-button-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring"
            >
              <RiChat3Line className="size-4" aria-hidden />
              Zeke&apos;s live chat
            </Link>
          ) : null
        }
      />
      <ConversationColumn>
        <EventLine>
          {shortTime(r.createdAt)} · {r.timeline[0]?.text ?? "Stock check"}
        </EventLine>

        <ZekeSays state={r.status === "proposed" ? "waiting" : "idle"}>
          <p>{r.reason}</p>
        </ZekeSays>

        {r.status === "proposed" ? (
          <Indented className="flex flex-col gap-3 rounded-3xl border border-accent-200 bg-background-primary-default p-4">
            <p className="text-headline-medium">
              Ask {r.supplierIds.length} suppliers for {r.quantity} {unit}, about AED {formatMoney(r.estimate)} incl. VAT?
            </p>
            <p className="text-body-regular text-text-secondary">
              {r.supplierIds.map(supplierName).join(", ")} · must arrive by {r.deadline}. Asking costs nothing; you approve the PO later.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button disabled={pending} onClick={() => run(() => approveRestock(r.id), "Zeke is asking suppliers now.")}>
                Ask for quotes
              </Button>
              <Button variant="secondary" disabled={pending} onClick={() => run(() => skipRestock(r.id))}>
                Skip this time
              </Button>
            </div>
          </Indented>
        ) : null}

        {r.status === "approved" ? (
          <ZekeSays state="working">
            <p className="text-body-medium text-text-secondary">Approved. Asking suppliers now…</p>
          </ZekeSays>
        ) : null}

        {r.rfqs.length > 0 ? (
          <Indented className="flex flex-col gap-2.5 rounded-3xl border border-border-button-default bg-background-primary-default px-4.5 py-3.5">
            <div className="flex items-center gap-3">
              <span
                className={
                  waitingOn.length === 0
                    ? "rounded-full bg-state-success-base px-2.5 py-1 text-caption-1-medium text-state-success-text"
                    : "rounded-full bg-accent-50 px-2.5 py-1 text-caption-1-medium text-accent-700"
                }
              >
                {waitingOn.length === 0 ? "All in" : "Collecting"}
              </span>
              <span className="text-body-medium">
                {r.quotes.length} of {r.supplierIds.length} quotes in
              </span>
            </div>
            <ul className="flex flex-col gap-1 text-body-2-regular text-text-secondary">
              {r.rfqs.map((q) => (
                <li key={q.supplierId}>
                  Asked {supplierName(q.supplierId)} by {channelLabel[q.channel].toLowerCase()} · {shortTime(q.sentAt)}
                  {q.simulated ? " · simulated" : ""}
                </li>
              ))}
            </ul>
            {r.status === "collecting" && waitingOn.length > 0 ? (
              <div className="flex flex-wrap items-center gap-3 border-t border-separator-border pt-3">
                <Button
                  variant="secondary"
                  size="small"
                  leadingIcon={RiInboxArchiveLine}
                  disabled={pending}
                  onClick={() => run(() => deliverDemoReplies(r.id), "Replies delivered. Zeke is reading them.")}
                >
                  Deliver demo replies
                </Button>
                <span className="text-caption-1-regular text-text-tertiary">Stands in for Zeke&apos;s inbox and phone line until they&apos;re connected.</span>
              </div>
            ) : null}
          </Indented>
        ) : null}

        {r.quotes.length > 0 ? (
          <ZekeSays>
            {r.po ? (
              <p>
                <b className="font-semibold">Go with {supplierName(r.po.supplierId)}.</b>{" "}
                {r.quotes.find((q) => q.supplierId === r.po?.supplierId)?.meetsDeadline
                  ? `They can deliver all ${r.quantity} by ${r.deadline}, inside your AED ${formatMoney(company.orderLimit)} limit.`
                  : `Inside your AED ${formatMoney(company.orderLimit)} limit.`}
              </p>
            ) : (
              <p>Quotes so far:</p>
            )}
            <QuoteTable quotes={r.quotes} suppliers={suppliers} quantity={r.quantity} company={company} chosen={r.po?.supplierId} />
            {r.recommendation?.winner ? (
              <p className="text-body-2-regular text-text-secondary">
                Compared in code: {supplierName(r.recommendation.winner.supplierId)} is the cheapest quote meeting every must-have · AED{" "}
                {formatMoney(r.recommendation.winner.totalInclVat, 2)} incl. VAT.
                {r.recommendation.overLimit ? " Over your limit — nothing will be sent." : ""}
              </p>
            ) : null}
          </ZekeSays>
        ) : null}

        {questions.map((q) => (
          <Indented key={q.id}>
            <LetteredOptions
              question={q.text}
              options={q.options.map((option) => ({
                label: option,
                onPick: () => run(() => answerQuestion(r.id, q.id, option), "Answer sent to Zeke."),
              }))}
            />
          </Indented>
        ))}

        {r.status === "po-review" && r.po ? (
          <Indented className="flex flex-col gap-3.5 rounded-3xl border border-accent-200 bg-background-primary-default p-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-headline-medium">
                {r.po.number} · {poSupplier?.name}
              </span>
              <span className="text-body-regular text-text-secondary">
                {r.po.quantity} {unit} · <span className="font-mono">AED {formatMoney(poTotal)}</span> incl. VAT · {r.po.deliverBy}
                {r.po.status === "held" ? " · held, not sent" : ""}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <DrawerTrigger>
                <Button disabled={pending}>Review PO</Button>
                <Drawer size="lg" aria-label="Draft purchase order">
                  {({ close }) => (
                    <>
                      <DrawerHeader title="Draft purchase order" description="Nothing goes out until you approve." />
                      <DrawerBody className="flex flex-col gap-4">
                        <PurchaseOrderView po={r.po!} supplier={poSupplier} company={company} />
                      </DrawerBody>
                      <DrawerFooter className="flex-wrap gap-2.5">
                        <Button
                          onClick={() => {
                            close();
                            run(() => approvePo(r.id), "Approved. Zeke is sending it.");
                          }}
                        >
                          Approve and send
                        </Button>
                        <p className="text-caption-1-regular text-text-secondary">
                          {poSupplier?.name} gets this by email from <bdi dir="ltr">{company.zekeEmail}</bdi>.
                        </p>
                      </DrawerFooter>
                    </>
                  )}
                </Drawer>
              </DrawerTrigger>
              {r.po.status === "draft" ? (
                <Button variant="secondary" disabled={pending} onClick={() => run(() => holdPo(r.id))}>
                  Don&apos;t send
                </Button>
              ) : null}
            </div>
          </Indented>
        ) : null}

        {r.status === "blocked" && r.block ? <Blocked restock={r} company={company} unit={unit} supplierName={supplierName} pending={pending} onChoose={(choice) => run(() => resolveBlock(r.id, choice), "Zeke has your answer.")} /> : null}

        {r.status === "sent" && r.po ? (
          <ZekeSays state="done">
            <p role="status">
              {r.po.number} went to {poSupplier?.name} from <bdi dir="ltr">{company.zekeEmail}</bdi>
              {r.po.sentAt ? ` at ${shortTime(r.po.sentAt)}` : ""}.
            </p>
            {r.po.simulated ? <p className="text-body-2-regular text-text-secondary">Simulated: nothing left the machine.</p> : null}
          </ZekeSays>
        ) : null}

        {r.status === "skipped" ? (
          <ZekeSays>
            <p className="text-body-medium text-text-secondary">Skipped. Nothing was sent.</p>
          </ZekeSays>
        ) : null}

        {notice ? (
          <p role={notice.tone === "error" ? "alert" : "status"} className={notice.tone === "error" ? "ms-9.5 text-body-medium text-text-error-primary" : "ms-9.5 text-body-medium text-state-success-text"}>
            {notice.text}
          </p>
        ) : null}

        <details className="ms-9.5 text-body-2-regular text-text-secondary">
          <summary className="cursor-pointer text-text-primary">Everything that happened</summary>
          <ol className="mt-2 flex flex-col gap-1">
            {r.timeline.map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-24 shrink-0 font-mono text-text-tertiary">{longTime(t.at)}</span>
                <span>{t.text}</span>
              </li>
            ))}
          </ol>
        </details>
      </ConversationColumn>
    </>
  );
}

function Blocked({
  restock: r,
  company,
  unit,
  supplierName,
  pending,
  onChoose,
}: {
  restock: Restock;
  company: Company;
  unit: string;
  supplierName: (id: string) => string;
  pending: boolean;
  onChoose: (choice: string) => void;
}) {
  const block = r.block!;
  const over = block.total - company.orderLimit;
  const fill = (company.orderLimit / block.total) * 100;
  const affordable = Math.floor(company.orderLimit / block.perUnitInclVat);
  const choices = [
    { label: `Cut to ${affordable} ${unit}`, detail: `AED ${formatMoney(affordable * block.perUnitInclVat)} incl. VAT`, choice: `cut the quantity to ${affordable} ${unit}` },
    { label: "Ask the owner to allow this order", detail: "Only an owner can go over the limit", choice: "ask the owner to allow this order over the limit" },
    { label: "Ask more suppliers", detail: "Takes about a day", choice: "ask more suppliers for a cheaper quote" },
  ];

  return (
    <>
      <ZekeSays state="blocked">
        <p>I&apos;ve stopped here. {block.reason} Nothing has been sent.</p>
        <div className="flex flex-col gap-3 rounded-2xl border border-border-button-default bg-background-primary-default p-4">
          <div className="flex justify-between text-body-2-regular text-text-secondary">
            <span>This order</span>
            <span>Your limit per order</span>
          </div>
          <div
            className="relative h-3 rounded-full bg-background-quaternary-hover"
            role="img"
            aria-label={`This order is AED ${formatMoney(block.total)}, AED ${formatMoney(over)} over the AED ${formatMoney(company.orderLimit)} limit`}
          >
            <span className="absolute inset-y-0 start-0 rounded-s-full bg-text-primary" style={{ width: `${fill}%` }} />
            <span className="absolute -inset-y-1.5 w-0.5 bg-accent-500" style={{ insetInlineStart: `${fill}%` }} />
          </div>
          <div className="flex justify-between font-mono text-body-medium">
            <span>{formatMoney(block.total)}</span>
            <span className="text-accent-700">
              {formatMoney(company.orderLimit)} · over by {formatMoney(over)}
            </span>
          </div>
          <span className="text-body-2-regular text-text-secondary">
            {supplierName(block.supplierId)} · AED {block.perUnitInclVat.toFixed(2)} each incl. VAT ·{" "}
            <Link href={`/suppliers/${block.supplierId}`} className="text-accent-700 underline">
              see the supplier
            </Link>
          </span>
        </div>
      </ZekeSays>
      <Indented className={pending ? "pointer-events-none opacity-60" : undefined}>
        <LetteredOptions question="How should I continue?" options={choices.map((c) => ({ label: c.label, detail: c.detail, onPick: () => onChoose(c.choice) }))} />
      </Indented>
    </>
  );
}
