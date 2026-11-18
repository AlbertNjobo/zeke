import { RiArrowRightLine, RiMailLine, RiRepeatLine } from "@remixicon/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { AppShell, PageHeader } from "@/components/zeke/app-shell";
import { Composer } from "@/components/zeke/composer";
import { HomeActions } from "@/components/zeke/home-actions";
import { LiveScreenCard } from "@/components/zeke/live-screen";
import { ProposalCard } from "@/components/zeke/proposal-card";
import { StockBar } from "@/components/zeke/stock-bar";
import { ZekeFace } from "@/components/zeke/zeke-face";
import { getState } from "@/lib/zeke/server";
import {
  appMood,
  formatMoney,
  isLow,
  itemById,
  openQuestions,
  poTotals,
  supplierById,
  type Restock,
  type ZekeState,
} from "@/lib/zeke/views";

// Rendered per request: the greeting follows Dubai time and the cards follow Zeke's live state.
export const dynamic = "force-dynamic";

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Dubai" }).format(new Date()));
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
}

const COUNT_WORDS = ["Nothing needs", "One thing needs", "Two things need", "Three things need", "Four things need", "Five things need"];

export default async function HomePage() {
  const state = await getState();
  const open = state.restocks.filter((r) => r.status !== "sent" && r.status !== "skipped");
  const cards = open.flatMap((r) => needsYouCards(state, r));
  const working = open.filter((r) => r.status === "approved" || (r.status === "collecting" && openQuestions(r).length === 0));
  const onCall = working.find((r) => r.rfqs.some((q) => q.channel === "phone" && !r.quotes.some((x) => x.supplierId === q.supplierId)));
  const lowItems = state.items.filter(isLow);
  const watch = [...lowItems, ...state.items.filter((i) => !isLow(i))].slice(0, 3);
  const mood = appMood(state);

  return (
    <AppShell>
      <PageHeader actions={<HomeActions />}>
        <span className="text-headline-medium">Home</span>
      </PageHeader>

      <section className="flex flex-col items-center gap-4 px-5 pt-2 text-center md:px-8">
        <ZekeFace state={mood} size={68} decorative />
        <h1 className="text-display-3-semibold tracking-tight text-balance">
          {greeting()}. {cards.length === 0 ? "All clear." : `${COUNT_WORDS[cards.length] ?? `${cards.length} things need`} you.`}
        </h1>
        <p className="text-headline-regular text-text-secondary">
          {state.activity[0] ? `Latest: ${state.activity[0].text}.` : "Zeke checks stock every morning at 06:00."}
        </p>
        <Composer className="w-full max-w-160" placeholder="Restock receipt rolls, or ask what we spent on gloves" />
      </section>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-4.5 px-5 py-8 md:px-8">
        <Column title="Needs you" count={cards.length} attention={cards.length > 0}>
          {cards.length === 0 ? (
            <p className="rounded-3xl border border-border-button-default bg-background-primary-default p-4.5 text-body-regular text-text-secondary">
              Nothing waiting on you. Zeke will put proposals and purchase orders here.
            </p>
          ) : (
            cards
          )}
        </Column>

        <Column title="Zeke is working on">
          {onCall ? (
            <LiveScreenCard
              supplier={supplierById(state, onCall.rfqs.find((q) => q.channel === "phone")!.supplierId)?.name ?? "Supplier"}
              elapsed="live"
              line={`Could you quote ${onCall.quantity} ${itemById(state, onCall.itemId)?.unit ?? "units"} of ${itemById(state, onCall.itemId)?.name ?? ""}?`}
              title={`Calling about ${itemById(state, onCall.itemId)?.name ?? "a restock"}`}
            />
          ) : null}
          <div className="overflow-hidden rounded-3xl border border-border-button-default bg-background-primary-default">
            {working.map((r, i) => (
              <WorkRow key={r.id} href={`/conversations/${r.id}`} icon={<RiMailLine className="size-4" aria-hidden />} title={`Quotes for ${itemById(state, r.itemId)?.name ?? r.itemId}`} divided={i > 0}>
                <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${r.supplierIds.length}, minmax(0, 1fr))` }} aria-hidden>
                  {r.supplierIds.map((id) => (
                    <span key={id} className={r.quotes.some((q) => q.supplierId === id) ? "h-1 rounded-full bg-text-primary" : "h-1 rounded-full bg-background-tertiary-default"} />
                  ))}
                </div>
                <span className="text-body-2-regular text-text-secondary">
                  {r.status === "approved" ? "Asking suppliers now" : `${r.quotes.length} of ${r.supplierIds.length} replied`}
                </span>
              </WorkRow>
            ))}
            <WorkRow icon={<RiRepeatLine className="size-4" aria-hidden />} title="Stock check" divided={working.length > 0}>
              <span className="text-body-2-regular text-text-secondary">Every day at 06:00 · {lowItems.length} items below reorder point</span>
            </WorkRow>
          </div>
        </Column>

        <Column
          title="Stock watch"
          action={
            <Link href="/stock" className="text-body-2-regular text-text-secondary hover:text-text-primary">
              All items
            </Link>
          }
        >
          <div className="flex flex-col divide-y divide-separator-border rounded-3xl border border-border-button-default bg-background-primary-default px-4.5">
            {watch.map((item) => (
              <div key={item.id} className="py-3">
                <StockBar item={item} />
              </div>
            ))}
          </div>
          <SpendCard state={state} />
        </Column>
      </div>
    </AppShell>
  );
}

function needsYouCards(state: ZekeState, r: Restock): ReactNode[] {
  const item = itemById(state, r.itemId);
  const cards: ReactNode[] = [];
  if (r.status === "proposed" && item) {
    cards.push(
      <ProposalCard
        key={`${r.id}-proposal`}
        restockId={r.id}
        itemName={item.name}
        onHand={item.onHand}
        reorderPoint={item.reorderPoint}
        unit={item.unit}
        quantity={r.quantity}
        supplierCount={r.supplierIds.length}
        estimate={`About AED ${formatMoney(r.estimate)} incl. VAT`}
      />,
    );
  }
  if (r.status === "po-review" && r.po) {
    const total = poTotals(r.po, state.company.vatRate).total;
    cards.push(
      <LinkCard
        key={`${r.id}-po`}
        href={`/conversations/${r.id}`}
        tag={`Purchase order · ${r.po.number}`}
        title={`Send ${r.po.quantity} ${item?.name ?? ""} to ${supplierById(state, r.po.supplierId)?.name} for AED ${formatMoney(total)} incl. VAT?`}
        body={`Best of ${r.quotes.length} quotes, sources attached. ${r.po.deliverBy}.${r.po.status === "held" ? " You held it." : ""}`}
        cta="Review the PO"
        attention
      />,
    );
  }
  if (r.status === "blocked" && r.block) {
    cards.push(
      <LinkCard
        key={`${r.id}-blocked`}
        href={`/conversations/${r.id}`}
        tag={`Blocked · ${item?.name ?? r.itemId}`}
        title={`Best quote is AED ${formatMoney(r.block.total)}, over your AED ${formatMoney(state.company.orderLimit)} limit. How should Zeke continue?`}
        cta="Choose"
      />,
    );
  }
  for (const q of openQuestions(r)) {
    cards.push(
      <LinkCard key={q.id} href={`/conversations/${r.id}`} tag={`Question · ${item?.name ?? r.itemId}`} title={q.text} cta="Answer" />,
    );
  }
  return cards;
}

function LinkCard({ href, tag, title, body, cta, attention }: { href: string; tag: string; title: string; body?: string; cta: string; attention?: boolean }) {
  return (
    <Link
      href={href}
      className={
        attention
          ? "group flex flex-col gap-2.5 rounded-3xl border border-accent-200 bg-background-primary-default p-4.5 outline-none hover:border-accent-300 focus-visible:ring-2 focus-visible:ring-border-focus-ring"
          : "group flex flex-col gap-2.5 rounded-3xl border border-border-button-default bg-background-primary-default p-4.5 outline-none hover:border-border-button-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring"
      }
    >
      <span className={attention ? "font-mono text-caption-1-medium uppercase text-accent-700" : "font-mono text-caption-1-medium uppercase text-text-secondary"}>{tag}</span>
      <span className="text-title-3-medium">{title}</span>
      {body ? <span className="text-body-regular text-text-secondary">{body}</span> : null}
      <span className={attention ? "flex items-center gap-1.5 text-body-medium text-accent-700" : "flex items-center gap-1.5 text-body-medium text-text-primary"}>
        {cta}
        <RiArrowRightLine className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" aria-hidden />
      </span>
    </Link>
  );
}

function SpendCard({ state }: { state: ZekeState }) {
  const sent = state.restocks.filter((r) => r.po?.status === "sent");
  const total = sent.reduce((sum, r) => sum + poTotals(r.po!, state.company.vatRate).total, 0);
  return (
    <div className="flex flex-col gap-2 rounded-3xl border border-border-button-default bg-background-primary-default p-4.5">
      <div className="flex items-baseline justify-between">
        <span className="text-body-medium">Sent through Zeke</span>
        <span className="font-mono text-title-2-regular">AED {formatMoney(total)}</span>
      </div>
      <span className="text-body-2-regular text-text-secondary">
        {sent.length} purchase {sent.length === 1 ? "order" : "orders"} · limit AED {formatMoney(state.company.orderLimit)} per order
      </span>
    </div>
  );
}

function Column({ title, count, attention, action, children }: { title: string; count?: number; attention?: boolean; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-body-semibold">
        {attention ? <span className="size-2 rounded-full bg-accent-500" aria-hidden /> : null}
        {title}
        {count !== undefined ? <span className="font-mono font-medium text-accent-700">{count}</span> : null}
        {action ? <span className="ms-auto font-normal">{action}</span> : null}
      </h2>
      {children}
    </section>
  );
}

function WorkRow({ icon, title, divided, href, children }: { icon: ReactNode; title: string; divided?: boolean; href?: string; children: ReactNode }) {
  const className = divided ? "flex items-start gap-3 border-t border-separator-border px-4.5 py-4" : "flex items-start gap-3 px-4.5 py-4";
  const body = (
    <>
      <span className="flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-background-secondary-default text-foreground-icon-primary">{icon}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="text-headline-medium">{title}</span>
        {children}
      </div>
    </>
  );
  return href ? (
    <Link href={href} className={`${className} outline-none hover:bg-background-primary-hover focus-visible:bg-background-primary-hover`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
