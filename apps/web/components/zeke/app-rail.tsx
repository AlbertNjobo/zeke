"use client";

import { RiBox3Line, RiChat3Line, RiComputerLine, RiHistoryLine, RiHome5Line, RiTeamLine } from "@remixicon/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ZekeFace } from "@/components/zeke/zeke-face";
import type { ZekeMood as ZekeState } from "@/lib/zeke/views";
import { cx } from "@/utils/cx";

const NAV = [
  { href: "/", label: "Home", icon: RiHome5Line, match: (p: string) => p === "/" },
  { href: "/conversations", label: "Chats", icon: RiChat3Line, match: (p: string) => p.startsWith("/conversations") },
  { href: "/stock", label: "Stock", icon: RiBox3Line, match: (p: string) => p.startsWith("/stock") },
  { href: "/suppliers", label: "Suppliers", icon: RiTeamLine, match: (p: string) => p.startsWith("/suppliers") },
  { href: "/audit", label: "Audit", icon: RiHistoryLine, match: (p: string) => p.startsWith("/audit") },
] as const;

interface AppRailProps {
  zekeState: ZekeState;
  /** Shows a dot on Chats when something needs the buyer. */
  needsYou: boolean;
}

export function AppRail({ zekeState, needsYou }: AppRailProps) {
  const pathname = usePathname();
  const screenActive = pathname.startsWith("/screen");

  return (
    <nav
      aria-label="Main"
      className="flex w-full shrink-0 items-center gap-1 bg-rail px-3 py-2 md:sticky md:top-0 md:h-dvh md:w-[84px] md:flex-col md:gap-2 md:px-0 md:py-5"
    >
      <Link href="/" aria-label="Zeke home" className="me-2 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring md:me-0 md:mb-4">
        <ZekeFace state={zekeState} size={36} hole="var(--color-rail)" />
      </Link>
      {NAV.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "relative flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring md:w-16",
              active ? "text-accent-700" : "text-text-secondary hover:text-text-primary",
            )}
          >
            <span
              className={cx(
                "flex size-10 items-center justify-center rounded-xl transition-colors",
                active ? "bg-accent-100" : "hover:bg-background-secondary-hover",
              )}
            >
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="text-caption-2-medium">{label}</span>
            {href === "/conversations" && needsYou ? (
              <span className="absolute end-3 top-1.5 size-2.5 rounded-full border-2 border-rail bg-accent-500 md:end-4" aria-label="Something needs you" />
            ) : null}
          </Link>
        );
      })}
      <Link
        href="/screen"
        aria-current={screenActive ? "page" : undefined}
        className={cx(
          "ms-auto flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring md:ms-0 md:mt-auto md:w-16",
          screenActive ? "text-accent-700" : "text-text-secondary hover:text-text-primary",
        )}
      >
        <span className={cx("flex size-10 items-center justify-center rounded-xl", screenActive ? "bg-accent-100" : "hover:bg-background-secondary-hover")}>
          <RiComputerLine className="size-5" aria-hidden />
        </span>
        <span className="text-caption-2-medium">Screen</span>
      </Link>
    </nav>
  );
}
