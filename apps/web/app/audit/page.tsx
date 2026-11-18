import Link from "next/link";
import { AppShell, PageHeader } from "@/components/zeke/app-shell";
import { getState } from "@/lib/zeke/server";
import { longTime } from "@/lib/zeke/views";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const state = await getState();
  const events = [...(state.auditLog ?? [])].reverse();

  return (
    <AppShell>
      <PageHeader>
        <span className="text-headline-medium">Audit log</span>
      </PageHeader>

      <div className="flex w-full max-w-270 flex-col gap-5 px-5 py-6 md:px-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-display-4-semibold tracking-tight">Who decided what</h1>
          <p className="text-body-regular text-text-secondary">
            Append-only record of approvals, sends, quotes and judgement calls. Zeke logs its own actions; you log yours in the app.
          </p>
        </div>

        {events.length === 0 ? (
          <p className="rounded-3xl border border-border-button-default bg-background-primary-default p-4.5 text-body-regular text-text-secondary">
            Nothing recorded yet.
          </p>
        ) : (
          <ol className="flex flex-col divide-y divide-separator-border rounded-3xl border border-border-button-default bg-background-primary-default px-4.5">
            {events.map((event) => (
              <li key={event.id} className="flex flex-col gap-1.5 py-3.5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-mono text-caption-1-regular text-text-tertiary">{longTime(event.at)}</span>
                  <span
                    className={
                      event.actor === "buyer"
                        ? "rounded-full bg-accent-50 px-2.5 py-1 text-caption-1-medium text-accent-700"
                        : "rounded-full bg-background-secondary-default px-2.5 py-1 text-caption-1-medium text-text-secondary"
                    }
                  >
                    {event.actor === "buyer" ? "You" : event.actor === "zeke" ? "Zeke" : "System"}
                  </span>
                  <span className="text-body-semibold">{event.action}</span>
                </div>
                <p className="text-body-2-regular text-text-secondary">{event.detail}</p>
                {event.restockId ? (
                  <Link
                    href={`/conversations/${event.restockId}`}
                    className="w-fit text-body-2-regular text-accent-700 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-border-focus-ring"
                  >
                    Open the conversation
                  </Link>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </div>
    </AppShell>
  );
}
