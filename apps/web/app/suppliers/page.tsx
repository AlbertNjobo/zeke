import Link from "next/link";
import { AppShell } from "@/components/zeke/app-shell";
import { SupplierApproval } from "@/components/zeke/supplier-approval";
import { getState } from "@/lib/zeke/server";
import { longTime } from "@/lib/zeke/views";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const { suppliers } = await getState();
  const pending = suppliers.filter((s) => !s.approved);
  const approved = suppliers.filter((s) => s.approved);

  return (
    <AppShell>
      <div className="flex w-full max-w-270 flex-col gap-5 px-5 py-7 md:px-10">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-display-4-semibold tracking-tight">Suppliers</h1>
          <span className="text-body-regular text-text-secondary">Zeke talks to them by email, WhatsApp and phone. They never log in.</span>
        </div>

        {pending.length > 0 ? (
          <section className="flex flex-col gap-2.5 rounded-3xl border border-accent-200 bg-accent-50 p-4.5">
            <h2 className="text-body-semibold">New suppliers need your approval</h2>
            <p className="text-body-2-regular text-text-secondary">Zeke will not contact them until you approve. Check the source and vetting note first.</p>
            <ul className="flex flex-col gap-3">
              {pending.map((s) => (
                <li key={s.id} className="flex flex-col gap-1.5 border-t border-separator-border pt-3 first:border-0 first:pt-0">
                  <span className="text-headline-medium">{s.name}</span>
                  <span className="text-body-2-regular text-text-secondary">{s.vettingNote ?? `${s.contact} · ${s.categories}`}</span>
                  {s.sourceUrl ? (
                    <a href={s.sourceUrl} target="_blank" rel="noreferrer" className="w-fit text-body-2-regular text-accent-700 underline">
                      Source
                    </a>
                  ) : null}
                  <SupplierApproval supplierId={s.id} name={s.name} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <ul className="overflow-hidden rounded-3xl border border-border-button-default bg-background-primary-default">
          {approved.map((s, i) => (
            <li key={s.id} className={i > 0 ? "border-t border-separator-border" : undefined}>
              <Link href={`/suppliers/${s.id}`} className="flex items-center gap-4 px-5 py-4 outline-none hover:bg-background-primary-hover focus-visible:bg-background-primary-hover">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-text-primary text-body-semibold text-text-white">{s.initials}</span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-headline-medium">{s.name}</span>
                  <span className="truncate text-body-regular text-text-secondary">
                    {s.contact} · {s.categories}
                  </span>
                </span>
                <span className="hidden text-end text-body-2-regular text-text-secondary sm:block">
                  On time <span className="font-mono text-text-primary">{s.onTime}</span>
                  <br />
                  Last: {s.history[0] ? longTime(s.history[0].at) : "never"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
