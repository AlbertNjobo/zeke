"use client";

import { DotLottieReact, type DotLottie } from "@lottiefiles/dotlottie-react";
import { motion, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState, type CSSProperties } from "react";
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

const MACHINE_ID = "zeke";
/** Blooby's 720px composition draws the 148px body; scale the canvas so the body is exactly 1em. */
const CANVAS_EM = 720 / 148;

interface ZekeFaceProps {
  state?: ZekeState;
  /** Face size in px. */
  size?: number;
  /** The surface behind the face, so the tag hole matches it. A CSS colour or var(). */
  hole?: string;
  /** Decorative faces next to text that already names the state. */
  decorative?: boolean;
  /** Large faces turn toward the pointer. */
  interactive?: boolean;
  className?: string;
}

/** Zeke's character: a themed squircle body with a dotLottie state machine for the face. */
export function ZekeFace({
  state = "idle",
  size = 32,
  hole,
  decorative = false,
  interactive = false,
  className,
}: ZekeFaceProps) {
  const reduce = useReducedMotion();
  const [player, setPlayer] = useState<DotLottie | null>(null);
  const [ready, setReady] = useState(false);
  const tiltX = useSpring(0, { stiffness: 140, damping: 18, mass: 0.7 });
  const tiltY = useSpring(0, { stiffness: 140, damping: 18, mass: 0.7 });
  const turn = useSpring(0, { stiffness: 140, damping: 18, mass: 0.7 });

  useEffect(() => {
    if (!player || reduce) return;
    const start = () => {
      if (player.stateMachineLoad(MACHINE_ID)) {
        player.stateMachineStart();
        player.stateMachineOverrideState(state, true);
        setReady(true);
      }
    };
    player.addEventListener("load", start);
    if (player.isLoaded) start();
    return () => player.removeEventListener("load", start);
    // State is switched by the effect below; this one only boots the machine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, reduce]);

  useEffect(() => {
    if (ready && !reduce) player?.stateMachineOverrideState(state, true);
  }, [ready, reduce, player, state]);

  useEffect(() => {
    if (!interactive || reduce) return;
    const onMove = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      tiltX.set(x * size * 0.05);
      tiltY.set(y * size * 0.035);
      turn.set(x * 7);
    };
    const reset = () => {
      tiltX.set(0);
      tiltY.set(0);
      turn.set(0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", reset);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", reset);
    };
  }, [interactive, reduce, size, tiltX, tiltY, turn]);

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
      {!reduce ? (
        <motion.span className="zeke-lottie" style={interactive ? { x: tiltX, y: tiltY, rotate: turn } : undefined}>
          <DotLottieReact
            src="/zeke.lottie"
            autoplay={false}
            loop={false}
            dotLottieRefCallback={setPlayer}
            aria-hidden="true"
            style={{ width: "100%", height: "100%" }}
          />
        </motion.span>
      ) : null}
    </span>
  );
}
