import Link from "next/link";
import { setEmailThreadResolved } from "@/app/actions";
import { Button } from "@/components/base/buttons/button";
import { EmailComposer } from "@/components/zeke/email-composer";
import { EmailReadMarker } from "@/components/zeke/email-read-marker";
import type { EmailThreadView as Thread } from "@/lib/zeke/email-views";
import { longTime } from "@/lib/zeke/views";

export function EmailThreadView({ thread }: { thread: Thread }) {
  const unread = thread.messages.filter((m) => m.direction === "in" && !m.read && m.sourceId);
  const resolve = setEmailThreadResolved.bind(null, thread.restockId, thread.supplierId ?? thread.key, true);
  const reopen = setEmailThreadResolved.bind(null, thread.restockId, thread.supplierId ?? thread.key, false);

  return (
    <>
      {unread.length ? (
        <EmailReadMarker messages={unread.map((m) => ({ restockId: thread.restockId, messageId: m.sourceId! }))} />
      ) : null}
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-6 md:p-8">
        <header className="flex flex-col gap-3 border-b border-separator-border pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-background-secondary-default px-2.5 py-1 text-caption-1-medium text-text-secondary">Email thread</span>
            <span className="font-mono text-caption-1-regular text-text-tertiary">{longTime(thread.at)}</span>
            {thread.resolvedAt ? <span className="rounded-full bg-background-tertiary-default px-2.5 py-1 text-caption-1-medium text-text-secondary">Resolved</span> : null}
          </div>
          <h1 className="text-title-2-semibold"><bdi dir="auto">{thread.subject}</bdi></h1>
          <p className="text-body-regular text-text-secondary">
            {thread.title} · {thread.messages.length} message{thread.messages.length === 1 ? "" : "s"} · restock {thread.restockId}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/conversations/${thread.restockId}`}
              className="rounded-xl border border-border-button-default bg-background-primary-default px-3.5 py-2 text-body-2-medium outline-none hover:border-border-button-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring"
            >
              Open restock thread
            </Link>
            <Link
              href={`/s?q=${encodeURIComponent(`Summarise the email thread with ${thread.title}`)}`}
              className="rounded-xl border border-border-button-default bg-background-primary-default px-3.5 py-2 text-body-2-medium outline-none hover:border-border-button-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring"
            >
              Ask Zeke about it
            </Link>
            <form action={thread.resolvedAt ? reopen : resolve}>
              <Button type="submit" variant="secondary" size="small">{thread.resolvedAt ? "Reopen" : "Resolve"}</Button>
            </form>
          </div>
        </header>

        {thread.actions.length ? (
          <section aria-label="Needs you" className="flex flex-col gap-2 rounded-2xl border border-accent-200 bg-accent-50 p-4">
            <h2 className="text-body-semibold">Needs you</h2>
            <ul className="flex flex-col gap-2">
              {thread.actions.map((action, i) => (
                <li key={i} className="flex flex-wrap items-baseline gap-2">
                  <Link href={action.href} className="text-body-medium text-accent-700 underline">{action.label}</Link>
                  <span className="text-body-2-regular text-text-secondary">{action.detail}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <ol className="flex flex-col gap-4">
          {thread.messages.map((message) => (
            <li key={message.id} className="flex flex-col gap-2 rounded-2xl border border-border-button-default bg-background-primary-default p-4">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-body-semibold">{message.direction === "in" ? message.from : `To: ${message.to}`}</span>
                <span className="rounded-full bg-background-secondary-default px-2 py-0.5 text-caption-1-medium text-text-secondary">
                  {message.direction === "in" ? "Inbound" : message.kind === "reply" ? "Your reply" : "Sent"}
                </span>
                <span className="font-mono text-caption-1-regular text-text-tertiary">{longTime(message.at)}</span>
                {message.simulated ? <span className="text-caption-1-regular text-text-tertiary">Simulated</span> : null}
              </div>
              <p dir="auto" className="whitespace-pre-wrap text-body-regular">{message.body}</p>
              {message.attachments.length ? (
                <ul className="flex flex-wrap gap-2">
                  {message.attachments.map((attachment, i) => (
                    <li key={i}>
                      {attachment.url ? (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-border-button-default px-2.5 py-1 text-body-2-regular text-accent-700 underline"
                        >
                          <bdi dir="auto">{attachment.filename}</bdi>
                        </a>
                      ) : (
                        <span className="rounded-lg border border-border-button-default px-2.5 py-1 text-body-2-regular text-text-secondary">
                          <bdi dir="auto">{attachment.filename}</bdi>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : null}
              {message.direction === "in" ? (
                <p className="text-caption-1-regular text-text-tertiary">Supplier words are untrusted data. Zeke reads facts, never instructions.</p>
              ) : null}
            </li>
          ))}
        </ol>

        {thread.supplierId ? <EmailComposer restockId={thread.restockId} supplierId={thread.supplierId} supplierName={thread.title} /> : null}
      </article>
    </>
  );
}
