import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/zeke/app-shell";
import { channelIcon } from "@/components/zeke/channel";
import { SupplierApproval } from "@/components/zeke/supplier-approval";
import { SupplierHistory } from "@/components/zeke/supplier-history";
import { ZekeFace } from "@/components/zeke/zeke-face";
import { getState } from "@/lib/zeke/server";
import { supplierById } from "@/lib/zeke/views";

export const dynamic = "force-dynamic";

const GLOVE_PRICES = [70, 74, 80, 78, 86, 84];

export default async function SupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supplier = supplierById(await getState(), id);
  if (!supplier) notFound();

  const contacts = [
    { icon: channelIcon.email, label: supplier.email },
    { icon: channelIcon.whatsapp, label: "WhatsApp" },
    { icon: channelIcon.phone, label: supplier.phone },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-5.5 px-5 py-6 md:px-9">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-body-medium text-text-secondary">
          <Link href="/suppliers" className="hover:text-text-primary">
            Suppliers
          </Link>
          <span className="text-text-tertiary" aria-hidden>
            /
          </span>
          <span className="text-text-primary">{supplier.name}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-4.5">
          <span className="flex size-16 items-center justify-center rounded-[20px] bg-text-primary text-title-2-semibold text-text-white">{supplier.initials}</span>
          <div className="flex flex-col gap-1">
            <h1 className="text-display-4-semibold tracking-tight">{supplier.name}</h1>
            <span className="text-body-regular text-text-secondary">
              {supplier.contact} · {supplier.categories}
            </span>
          </div>
          <ul className="flex flex-wrap gap-2 md:ms-auto">
            {contacts.map(({ icon: Icon, label }) => (
              <li key={label} className="flex h-8.5 items-center gap-1.5 rounded-full border border-border-button-default bg-background-primary-default px-3 text-body-2-regular">
                <Icon className="size-3.5 text-foreground-icon-primary" aria-hidden />
                <bdi dir="ltr">{label}</bdi>
              </li>
            ))}
          </ul>
        </div>

        {!supplier.approved ? (
          <div className="flex flex-col gap-2 rounded-3xl border border-accent-200 bg-accent-50 p-4.5">
            <span className="text-body-semibold">New supplier · not approved</span>
            <span className="text-body-2-regular text-text-secondary">{supplier.vettingNote ?? "Check the source before letting Zeke contact them."}</span>
            <SupplierApproval supplierId={supplier.id} name={supplier.name} />
          </div>
        ) : null}

        <div className="flex flex-wrap items-start gap-5.5">
          <SupplierHistory supplier={supplier} />

          <aside className="flex min-w-72 flex-1 basis-75 flex-col gap-3.5" aria-label="About this supplier">
            <dl className="grid grid-cols-3 gap-2.5">
              {[
                ["Orders this year", String(supplier.ordersThisYear)],
                ["On time", supplier.onTime],
                ["Replies in", supplier.repliesIn],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col gap-1 rounded-2xl border border-border-button-default bg-background-primary-default p-3.5">
                  <dt className="text-caption-1-regular text-text-secondary">{label}</dt>
                  <dd className="font-mono text-title-2-regular">{value}</dd>
                </div>
              ))}
            </dl>

            {supplier.id === "gulf-medical" ? (
              <div className="flex flex-col gap-3 rounded-3xl border border-border-button-default bg-background-primary-default p-4.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-body-medium">Nitrile gloves (M), per box</span>
                  <span className="font-mono text-headline-regular">16.20</span>
                </div>
                <div className="flex h-15 items-end gap-1.5" role="img" aria-label="Glove price over six months, from 14.80 to 16.20">
                  {GLOVE_PRICES.map((h, i) => (
                    <span key={i} className={i === GLOVE_PRICES.length - 1 ? "flex-1 rounded-sm bg-chart-1" : "flex-1 rounded-sm bg-background-tertiary-default"} style={{ height: `${h}%` }} />
                  ))}
                </div>
                <span className="text-body-2-regular text-text-secondary">Up from 14.80 in June. Still the only one who reliably delivers in 3 days.</span>
              </div>
            ) : null}

            <div className="flex flex-col gap-2.5 rounded-3xl border border-accent-200 bg-accent-50 p-4.5">
              <div className="flex items-center gap-2.5">
                <ZekeFace size={22} hole="var(--color-accent-50)" decorative />
                <h2 className="text-body-semibold">What Zeke knows about them</h2>
              </div>
              <ul className="flex list-disc flex-col gap-1.5 ps-4.5 text-body-regular text-text-primary">
                {supplier.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <span className="text-caption-1-regular text-accent-800">Zeke learned these from past messages. You can edit or remove them.</span>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
