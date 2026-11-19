import { RiCheckLine, RiLockLine } from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { AppShell, PageHeader } from "@/components/zeke/app-shell";
import { channelIcon } from "@/components/zeke/channel";
import { LiveWave, Wallpaper } from "@/components/zeke/live-screen";
import { ZekeFace } from "@/components/zeke/zeke-face";
import { cx } from "@/utils/cx";

const TRANSCRIPT = [
  { who: "Zeke", text: `Hi Rashid, I'm Zeke, calling for Oasis Clinics' purchasing. What's your price on 120 rolls of masking tape?`, zeke: true },
  { who: "Rashid", text: "8.90 a roll. All 120 in stock.", zeke: false },
  { who: "Zeke", text: "Could they arrive by Monday? That's a must for us.", zeke: true },
  { who: "Rashid", text: "Let me check with the warehouse...", zeke: false, pending: true },
];

const GOALS = [
  { label: "Price per roll", value: "AED 8.90", state: "done" },
  { label: "120 rolls by Monday", value: "Checking now", state: "live" },
  { label: "Payment terms", state: "todo" },
  { label: `Written quote to zeke@[yourco].com`, state: "todo" },
] as const;

export default function ScreenPage() {
  return (
    <AppShell zekeState="working">
      <PageHeader
        actions={
          <div className="flex gap-2">
            <Button variant="secondary">Listen in</Button>
            <Button>Take over the call</Button>
          </div>
        }
      >
        <h1 className="text-headline-medium">Zeke&apos;s screen</h1>
        <span className="flex items-center gap-1.5 text-caption-1-medium text-accent-700">
          <span className="size-1.5 rounded-full bg-accent-500" aria-hidden />
          Live
        </span>
      </PageHeader>

      <Wallpaper className="mx-3 mb-3 flex min-h-180 flex-1 items-center justify-center rounded-3xl px-4 pb-24 pt-12 md:mx-4">
        <span className="absolute left-5 top-4 font-mono text-caption-1-regular text-wallpaper-ink">11:03 · MORNING</span>

        <section
          aria-label="Call with Fresh Pack Co."
          className="relative flex w-full max-w-230 flex-wrap overflow-hidden rounded-3xl bg-background-primary-default shadow-xl"
          dir="auto"
        >
          <div className="flex min-w-0 flex-[999_1_460px] flex-col gap-4.5 p-6">
            <div className="flex items-center gap-3.5">
              <ZekeFace state="working" size={44} hole="var(--color-background-primary-default)" interactive />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-title-3-semibold">Fresh Pack Co.</span>
                <span className="text-body-2-regular text-text-secondary">Zeke&apos;s line to Rashid, sales</span>
              </div>
              <span className="font-mono text-title-2-regular">00:48</span>
              <LiveWave className="h-7" />
            </div>

            <ol className="flex flex-col gap-3 text-headline-regular">
              {TRANSCRIPT.map((line, i) => (
                <li key={i} className={cx("flex gap-3", line.pending && "text-text-tertiary")}>
                  <span className={cx("w-16 shrink-0 pt-0.5 text-body-2-medium", line.zeke ? "text-accent-700" : "text-text-secondary")}>{line.who}</span>
                  <span>{line.text}</span>
                </li>
              ))}
            </ol>

            <p className="mt-auto flex items-center gap-2.5 rounded-2xl bg-background-secondary-default px-3.5 py-3 text-body-2-regular text-text-secondary">
              <RiLockLine className="size-4 shrink-0 text-foreground-icon-primary" aria-hidden />
              Zeke can ask for prices and dates. It can&apos;t agree to buy anything on a call.
            </p>
          </div>

          <div className="flex flex-[1_1_280px] flex-col gap-3.5 border-s border-separator-border bg-background-full p-6">
            <h2 className="font-mono text-caption-1-medium text-text-secondary">WHAT ZEKE NEEDS FROM THIS CALL</h2>
            <ul className="flex flex-col gap-3.5 text-body-medium">
              {GOALS.map((goal) => (
                <li key={goal.label} className={cx("flex items-start gap-2.5", goal.state === "todo" && "text-text-secondary")}>
                  {goal.state === "done" ? (
                    <RiCheckLine className="size-4.5 shrink-0 text-state-success-mark" aria-label="Got it" />
                  ) : goal.state === "live" ? (
                    <span className="size-4.5 shrink-0 animate-spin rounded-full border-2 border-accent-500 border-e-transparent motion-reduce:animate-none" aria-label="In progress" />
                  ) : (
                    <span className="size-4.5 shrink-0 rounded-full border-2 border-border-button-hover" aria-label="Not yet" />
                  )}
                  <span>
                    {goal.label}
                    {"value" in goal ? (
                      <span className={cx("block", goal.state === "live" ? "text-accent-700" : "font-mono text-text-secondary")}>{goal.value}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-auto border-t border-separator-border pt-3.5 text-body-2-regular text-text-secondary">
              After the call, Zeke files the quote with the others and updates your comparison.
            </p>
          </div>
        </section>

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2.5 rounded-2xl bg-background-primary-default/70 px-3 py-2" aria-hidden>
          {[channelIcon.email, channelIcon.whatsapp, channelIcon.phone, channelIcon.po].map((Icon, i) => (
            <span key={i} className={cx("flex size-10 items-center justify-center rounded-xl", i === 2 ? "bg-accent-500 text-text-white" : "bg-background-primary-default text-foreground-icon-primary")}>
              <Icon className="size-4.5" />
            </span>
          ))}
        </div>
      </Wallpaper>
    </AppShell>
  );
}
