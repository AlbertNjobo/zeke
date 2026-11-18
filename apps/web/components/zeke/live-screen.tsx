import Link from "next/link";
import { cx } from "@/utils/cx";

/** Three moving bars that say "a call is live". Decorative. */
export function LiveWave({ className }: { className?: string }) {
  return (
    <span className={cx("zeke-wave flex h-3.5 items-center gap-0.5", className)} aria-hidden>
      <span className="h-1.5" />
      <span className="h-3.5 [animation-delay:200ms]" />
      <span className="h-2 [animation-delay:400ms]" />
      <span className="h-3 [animation-delay:600ms]" />
    </span>
  );
}

/**
 * Zeke's own desktop: a wallpaper with a sun and hills, separate from the buyer's world.
 * Decorative art, so it keeps physical positions in every reading direction.
 */
export function Wallpaper({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cx("relative overflow-hidden bg-wallpaper-sky", className)} dir="ltr">
      <span aria-hidden className="absolute -top-10 right-[-10px] size-28 rounded-full bg-wallpaper-sun" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/4 bg-wallpaper-hill" />
      {children}
    </div>
  );
}

interface LiveScreenCardProps {
  supplier: string;
  elapsed: string;
  line: string;
  title: string;
}

/** Small live preview of Zeke's screen while it is on a call. Opens the full screen. */
export function LiveScreenCard({ supplier, elapsed, line, title }: LiveScreenCardProps) {
  return (
    <Link
      href="/screen"
      className="group flex flex-col gap-2.5 rounded-3xl border border-border-button-default bg-background-primary-default p-2.5 outline-none hover:border-accent-300 focus-visible:ring-2 focus-visible:ring-border-focus-ring"
    >
      <Wallpaper className="h-36 rounded-2xl">
        <span className="absolute left-3 top-2.5 flex items-center gap-1.5 font-mono text-caption-2-medium text-wallpaper-ink">
          <span className="size-1.5 rounded-full bg-accent-500" />
          LIVE
        </span>
        <div className="absolute inset-x-3.5 top-8 flex flex-col gap-1.5 rounded-xl bg-background-primary-default px-3 py-2.5 shadow-md">
          <span className="flex items-center gap-2 text-caption-1-semibold">
            {supplier} · <span className="font-mono">{elapsed}</span>
            <LiveWave className="ms-auto" />
          </span>
          <span className="text-caption-1-regular text-text-secondary">
            <b className="font-medium text-text-primary">Zeke:</b> {line}
          </span>
        </div>
      </Wallpaper>
      <span className="flex items-center gap-2 px-1.5 pb-1">
        <span className="text-headline-medium">{title}</span>
        <span className="ms-auto text-body-medium text-accent-700 group-hover:underline">Watch</span>
      </span>
    </Link>
  );
}

/** Compact header chip: Zeke is busy on its own machine right now. */
export function LiveScreenChip({ label }: { label: string }) {
  return (
    <Link
      href="/screen"
      className="flex h-10 items-center gap-2.5 rounded-xl border border-border-button-default bg-background-primary-default ps-3 pe-1.5 text-body-2-medium outline-none hover:border-accent-300 focus-visible:ring-2 focus-visible:ring-border-focus-ring"
    >
      <LiveWave />
      <span className="truncate">{label}</span>
      <Wallpaper className="h-7 w-11 shrink-0 rounded-md">
        <span aria-hidden className="absolute inset-x-1.5 top-1.5 h-3 rounded-sm bg-background-primary-default" />
      </Wallpaper>
    </Link>
  );
}
