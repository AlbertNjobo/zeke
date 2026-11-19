"use client";

import type { CSSProperties } from "react";
import type { ZekeMood as ZekeState } from "@/lib/zeke/views";
import { cx } from "@/utils/cx";
import { ZekeBot } from "@/components/zeke/bot/ZekeBot";

const LABELS: Record<ZekeState, string> = {
  idle: "Zeke is idle",
  thinking: "Zeke is thinking",
  working: "Zeke is working",
  waiting: "Zeke is waiting on you",
  blocked: "Zeke is blocked",
  done: "Zeke is done",
};

interface ZekeFaceProps {
  state?: ZekeState;
  /** Face size in px. */
  size?: number;
  /** Kept for callers; the Bloub engine draws its own body. */
  hole?: string;
  /** Decorative faces next to text that already names the state. */
  decorative?: boolean;
  /** Large faces follow the pointer with the engine's gaze rig. */
  interactive?: boolean;
  className?: string;
}

/** Zeke's animated character, rendered by the ported MIT-licensed Bloub engine. */
export function ZekeFace({ state = "idle", size = 32, decorative = false, interactive = false, className }: ZekeFaceProps) {
  const style = { fontSize: size } as CSSProperties;
  return (
    <span
      className={cx("zeke-face inline-block", className)}
      data-state={state}
      style={style}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : LABELS[state]}
      aria-hidden={decorative ? true : undefined}
    >
      <ZekeBot state={state} size={size} follow={interactive} decorative={decorative} />
    </span>
  );
}
