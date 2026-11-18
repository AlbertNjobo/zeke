import type { ReactNode } from "react";
import { AppRail } from "@/components/zeke/app-rail";
import { LiveRefresh } from "@/components/zeke/live-refresh";
import { getState } from "@/lib/zeke/server";
import { appMood, isOpenNeedsYou, type ZekeMood } from "@/lib/zeke/views";
import { cx } from "@/utils/cx";

interface AppShellProps {
  children: ReactNode;
  /** Overrides the rail face, e.g. when this page's own state is the one that matters. */
  zekeState?: ZekeMood;
  /** Keep re-reading server data so Zeke's background work shows up. */
  live?: boolean;
  className?: string;
}

/** Rail plus page. The page scrolls with the document, so headers stay in normal flow. */
export async function AppShell({ children, zekeState, live = true, className }: AppShellProps) {
  const state = await getState();
  const needsYou = isOpenNeedsYou(state);

  return (
    <div className="flex min-h-dvh flex-col bg-background-full text-text-primary md:flex-row">
      <AppRail zekeState={zekeState ?? appMood(state)} needsYou={needsYou} />
      <main className={cx("flex min-w-0 flex-1 flex-col", className)}>{children}</main>
      {live ? <LiveRefresh /> : null}
    </div>
  );
}

interface PageHeaderProps {
  children?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ children, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-3 px-5 py-4 md:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2 text-body-medium">{children}</div>
      {actions}
    </header>
  );
}
