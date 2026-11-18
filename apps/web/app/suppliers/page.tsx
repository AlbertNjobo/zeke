import Link from "next/link";
import { AppShell } from "@/components/zeke/app-shell";
import { getState } from "@/lib/zeke/server";
import { longTime } from "@/lib/zeke/views";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const { suppliers } = await getState();
  return (
    <AppShell>
      <div className="flex w-full max-w-270 flex-col gap-5 px-5 py-7 md:px-10">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-display-4-semibold tracking-tight">Suppliers</h1>
          <span className="text-body-regular text-text-secondary">Zeke talks to them by email, WhatsApp and phone. They never log in.</span>
        </div>
        <ul className="overflow-hidden rounded-3xl border border-border-button-default bg-background-primary-default">
          {suppliers.map((s, i) => (
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
