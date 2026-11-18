import Link from "next/link";
import type { ReactNode } from "react";
import { ZekeFace } from "@/components/zeke/zeke-face";
import type { ZekeMood as ZekeState } from "@/lib/zeke/views";
import { cx } from "@/utils/cx";

export function ConversationHeader({ title, aside }: { title: string; aside?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-center gap-2.5 px-5 py-4 md:px-7">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2.5">
        <Link href="/conversations" className="text-body-medium text-text-secondary hover:text-text-primary">
          Conversations
        </Link>
        <span className="text-text-tertiary" aria-hidden>
          /
        </span>
        <h1 className="truncate text-headline-medium">{title}</h1>
      </nav>
      {aside ? <div className="ms-auto">{aside}</div> : null}
    </header>
  );
}

export function ConversationColumn({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-185 flex-1 flex-col gap-4.5 px-5 pb-8 pt-1.5 md:px-6">{children}</div>;
}

/** A thin centred line for things that happened, not things said. */
export function EventLine({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3.5 text-body-2-regular text-text-tertiary">
      <span className="h-px flex-1 bg-separator-border" aria-hidden />
      <span className="text-center">{children}</span>
      <span className="h-px flex-1 bg-separator-border" aria-hidden />
    </div>
  );
}

export function ZekeSays({ state = "idle", children }: { state?: ZekeState; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <ZekeFace state={state} size={26} decorative className="mt-0.5" />
      <div className="flex min-w-0 flex-1 flex-col gap-3 text-headline-regular">{children}</div>
    </div>
  );
}

export function YouSaid({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-[80%] self-end rounded-[20px] rounded-ee-md bg-text-primary px-4 py-3 text-body-medium text-text-white">{children}</p>
  );
}

/** Indented under Zeke's face, for cards that belong to Zeke's last message. */
export function Indented({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("ms-9.5", className)}>{children}</div>;
}

export interface LetteredOption {
  label: string;
  detail?: string;
  onPick: () => void;
}

/**
 * Lettered choices for questions Zeke asks. Spending money never goes through these:
 * a PO is approved from inside its own preview.
 */
export function LetteredOptions({ question, options }: { question: string; options: LetteredOption[] }) {
  return (
    <fieldset className="flex flex-col gap-3 rounded-3xl border border-border-button-default bg-background-primary-default p-4">
      <legend className="sr-only">{question}</legend>
      <p className="text-headline-medium" aria-hidden>
        {question}
      </p>
      <div className="flex flex-col overflow-hidden rounded-xl border border-separator-border">
        {options.map((option, i) => (
          <button
            key={option.label}
            type="button"
            onClick={option.onPick}
            className={cx(
              "flex items-center gap-3.5 px-3.5 py-3 text-start outline-none hover:bg-background-primary-hover focus-visible:bg-accent-50",
              i > 0 && "border-t border-separator-border",
            )}
          >
            <span className="w-3.5 font-mono text-body-medium text-accent-700">{String.fromCharCode(65 + i)}</span>
            <span className="flex flex-col gap-0.5">
              <span className="text-headline-regular">{option.label}</span>
              {option.detail ? <span className="text-body-2-regular text-text-secondary">{option.detail}</span> : null}
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
