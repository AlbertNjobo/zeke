import type { CSSProperties } from "react";
import type { ZekeMood as ZekeState } from "@/lib/zeke/views";
import { cx } from "@/utils/cx";

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
  /** The surface behind the face, so the tag hole matches it. A CSS colour or var(). */
  hole?: string;
  /** Decorative faces next to text that already names the state. */
  decorative?: boolean;
  className?: string;
}

/** Zeke's character: a squircle with a tag hole. Its eyes carry every state; styles live in globals.css. */
export function ZekeFace({ state = "idle", size = 32, hole, decorative = false, className }: ZekeFaceProps) {
  const style = { fontSize: size, ...(hole ? { "--zeke-hole": hole } : {}) } as CSSProperties;
  return (
    <span
      className={cx("zeke-face inline-block", className)}
      data-state={state}
      style={style}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : LABELS[state]}
      aria-hidden={decorative ? true : undefined}
    >
      <span className="zeke-hole" />
      <span className="zeke-eye" data-side="l" />
      <span className="zeke-eye" data-side="r" />
    </span>
  );
}
