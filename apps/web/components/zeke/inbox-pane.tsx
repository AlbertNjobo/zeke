"use client";

import type { ReactNode } from "react";
import { ScrollFade, useScrollFade } from "@/components/foundations/scroll-fade/scroll-fade";

/** Detail column with the BoardUI scroll-fade on its internal scroll region. */
export function InboxPane({ children }: { children: ReactNode }) {
  const fade = useScrollFade();
  return (
    <div className="relative min-h-0 flex-1 bg-background-full">
      <div onScroll={fade.onScroll} className="h-full overflow-y-auto">
        {children}
      </div>
      <ScrollFade progress={fade.progress} surfaceClassName="from-background-full" />
    </div>
  );
}
