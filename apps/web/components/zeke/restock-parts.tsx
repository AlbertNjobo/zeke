"use client";

import { RiCheckLine, RiFilePdf2Line, RiPlayFill } from "@remixicon/react";
import { useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { Drawer, DrawerBody, DrawerHeader, DrawerTrigger } from "@/components/base/drawer/drawer";
import { channelIcon } from "@/components/zeke/channel";
import { formatMoney, poTotals, type Company, type PurchaseOrder, type Quote, type QuoteSource, type Supplier } from "@/lib/zeke/views";
import { cx } from "@/utils/cx";

const SOURCE_LABEL: Record<QuoteSource["kind"], string> = { email: "Email", phone: "Call", whatsapp: "WhatsApp" };

export function QuoteTable({
  quotes,
  suppliers,
  quantity,
  company,
  chosen,
}: {
  quotes: Quote[];
  suppliers: Supplier[];
  quantity: number;
  company: Company;
  chosen?: string;
}) {
  const [active, setActive] = useState<string>();
  const name = (id: string) => suppliers.find((s) => s.id === id)?.name ?? id;
  return (
    <div className="overflow-x-auto rounded-2xl border border-border-table bg-background-primary-default">
      <table className="w-full min-w-120 text-body-medium">
        <thead>
          <tr className="bg-background-secondary-default font-mono text-caption-1-regular text-text-secondary">
            <th scope="col" className="px-3.5 py-2.5 text-start font-normal">SUPPLIER</th>
            <th scope="col" className="px-3.5 py-2.5 text-start font-normal">PER UNIT</th>
            <th scope="col" className="px-3.5 py-2.5 text-start font-normal">ALL {quantity} BY</th>
            <th scope="col" className="px-3.5 py-2.5 text-start font-normal">SOURCE</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((q) => {
            const Icon = channelIcon[q.source.kind];
            return (
              <tr key={q.supplierId} className={cx("border-t border-border-table", active === q.supplierId && "bg-accent-50")}>
                <td className={cx("px-3.5 py-2", chosen === q.supplierId && "font-medium")}>{name(q.supplierId)}</td>
                <td className="px-3.5 py-2 font-mono">{q.perUnit.toFixed(2)}</td>
                <td className={cx("px-3.5 py-2", q.meetsDeadline === true && "text-state-success-text", q.meetsDeadline === null && "text-accent-700")}>
                  {q.deliveryLabel}
                </td>
                <td className="px-3.5 py-2">
                  <DrawerTrigger onOpenChange={(open) => setActive(open ? q.supplierId : undefined)}>
                    <Button variant="secondary" size="small" leadingIcon={Icon}>
                      {SOURCE_LABEL[q.source.kind]}
                    </Button>
                    <Drawer size="lg" aria-label={`Source for ${name(q.supplierId)}'s quote`}>
                      <DrawerHeader title={`Source · ${name(q.supplierId)}`} description="Where the numbers in the comparison came from." />
                      <DrawerBody>
                        <SourceView source={q.source} company={company} supplierName={name(q.supplierId)} />
                      </DrawerBody>
                    </Drawer>
                  </DrawerTrigger>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function PurchaseOrderView({ po, supplier, company }: { po: PurchaseOrder; supplier?: Supplier; company: Company }) {
  const totals = poTotals(po, company.vatRate);
  return (
    <>
      <div className="flex flex-col gap-3.5 rounded-2xl border border-border-button-default p-4.5 text-body-2-regular">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-title-3-semibold">Purchase order</span>
            <span className="font-mono text-text-secondary">{po.number}</span>
          </div>
          <span className="rounded-full bg-accent-50 px-2.5 py-1 text-caption-1-medium text-accent-700">{po.status === "held" ? "Held" : "Draft"}</span>
        </div>
        <dl className="grid grid-cols-2 gap-3">
          <div>
            <dt className="text-caption-1-regular text-text-secondary">From</dt>
            <dd>
              {company.name}
              <br />
              {company.deliveryAddress}
            </dd>
          </div>
          <div>
            <dt className="text-caption-1-regular text-text-secondary">To</dt>
            <dd>
              {supplier?.name}
              <br />
              <bdi dir="ltr">{supplier?.email}</bdi>
            </dd>
          </div>
        </dl>
        <table className="w-full">
          <thead>
            <tr className="border-t border-separator-border font-mono text-caption-1-regular text-text-secondary">
              <th scope="col" className="pt-2.5 text-start font-normal">ITEM</th>
              <th scope="col" className="pt-2.5 text-start font-normal">QTY</th>
              <th scope="col" className="pt-2.5 text-start font-normal">EACH</th>
              <th scope="col" className="pt-2.5 text-end font-normal">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr className="align-baseline">
              <td className="py-2 pe-2">{po.description}</td>
              <td className="py-2 font-mono">{po.quantity}</td>
              <td className="py-2 font-mono">{po.unitPrice.toFixed(2)}</td>
              <td className="py-2 text-end font-mono">{formatMoney(totals.subtotal, 2)}</td>
            </tr>
          </tbody>
        </table>
        <div className="flex flex-col gap-1 border-t border-separator-border pt-2.5 font-mono">
          <div className="flex justify-between text-text-secondary">
            <span>VAT {Math.round(company.vatRate * 100)}%</span>
            <span>{formatMoney(totals.vat, 2)}</span>
          </div>
          <div className="flex justify-between text-headline-medium">
            <span>Total {company.currency}</span>
            <span>{formatMoney(totals.total, 2)}</span>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-3">
          <div>
            <dt className="text-caption-1-regular text-text-secondary">Deliver by</dt>
            <dd>{po.deliverBy}</dd>
          </div>
          <div>
            <dt className="text-caption-1-regular text-text-secondary">Payment</dt>
            <dd>{po.payment}</dd>
          </div>
        </dl>
      </div>
      {po.checks.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          <h3 className="font-mono text-caption-1-medium text-text-secondary">ZEKE CHECKED</h3>
          <ul className="flex flex-col gap-2 text-body-medium">
            {po.checks.map((check) => (
              <li key={check} className="flex items-center gap-2.5">
                <RiCheckLine className="size-4 shrink-0 text-state-success-mark" aria-hidden />
                {check}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

export function SourceView({ source, company, supplierName }: { source: QuoteSource; company: Company; supplierName: string }) {
  if (source.kind === "email") {
    return (
      <div className="flex flex-col gap-3.5 text-body-medium">
        <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-body-2-regular text-text-secondary">
          <dt className="font-medium text-text-primary">From</dt>
          <dd>
            <bdi dir="ltr">{source.from}</bdi>
          </dd>
          <dt className="font-medium text-text-primary">To</dt>
          <dd>
            <bdi dir="ltr">{company.zekeEmail}</bdi>
          </dd>
          <dt className="font-medium text-text-primary">Subject</dt>
          <dd>{source.subject}</dd>
        </dl>
        <p className="whitespace-pre-line">{source.body}</p>
        <div className="flex flex-col gap-2.5 rounded-xl border border-border-button-default p-3">
          {source.attachment ? (
            <span className="flex items-center gap-2 text-body-2-medium">
              <RiFilePdf2Line className="size-4" aria-hidden />
              {source.attachment}
            </span>
          ) : null}
          <span className="font-mono text-caption-1-regular text-text-secondary">WHAT ZEKE READ FROM IT</span>
          <dl className="grid grid-cols-2 gap-2 text-body-2-regular">
            {source.fields.map((f) => (
              <div key={f.label} className={cx("rounded-lg p-2", f.used ? "bg-accent-50" : "bg-background-secondary-default")}>
                <dt>{f.label}</dt>
                <dd className="font-medium">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    );
  }

  if (source.kind === "phone") {
    return (
      <div className="flex flex-col gap-3 text-body-medium">
        <div className="flex items-center gap-2.5 rounded-xl bg-background-secondary-default px-3 py-2.5">
          <Button iconOnly size="small" leadingIcon={RiPlayFill} aria-label="Play recording" />
          <span className="text-body-2-regular">Recording · {source.recording}</span>
        </div>
        <ol className="flex flex-col gap-1">
          {source.lines.map((line, i) => (
            <li key={i} className={cx("flex gap-2.5 rounded-lg px-1 py-1.5", line.used && "bg-accent-50")}>
              <span className="w-10 shrink-0 font-mono text-caption-1-regular text-text-tertiary">{line.at}</span>
              <span>
                <b className="font-medium">{line.who}:</b> {line.text}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-body-2-regular text-text-secondary">{source.note}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl bg-background-secondary-default p-4 text-body-medium">
      <span className="self-center text-caption-1-regular text-text-secondary">WhatsApp · Zeke&apos;s number and {supplierName}</span>
      {source.messages.map((m, i) => (
        <p
          key={i}
          className={cx(
            "max-w-[82%] rounded-2xl bg-background-primary-default px-3 py-2",
            m.from === "zeke" ? "self-end rounded-se-sm" : "self-start rounded-ss-sm border border-accent-200",
          )}
        >
          {m.text}
          {m.at ? <span className="block text-caption-2-regular text-text-tertiary">{m.at}</span> : null}
        </p>
      ))}
      {source.flag ? (
        <p className="mt-2 flex items-start gap-2.5 rounded-xl border border-accent-200 bg-accent-50 px-3 py-2.5 text-body-2-regular text-accent-800">
          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent-500" aria-hidden />
          {source.flag}
        </p>
      ) : null}
    </div>
  );
}
