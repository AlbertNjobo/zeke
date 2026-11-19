"use client";

import { useReducedMotion } from "motion/react";
import { useId, useEffect, useMemo, useRef, useState } from "react";
import { NOTIF_BLUE } from "./decor";
import { BotEngine, type BotFrame, type Look } from "./engine";
import { EXPRESSION_BY_ID } from "./expressions";
import { lookTarget, TURN_TIME } from "./gaze";
import { clamp, easings } from "./math";
import { DEMI_VIEWBOX, RAYON } from "./repere";
import { mixHex, SHAPE_BY_ID } from "./skins";
import { STATE_BY_ID, type StateId } from "./states";
import type { ZekeMood } from "@/lib/zeke/views";

const STATE_OF: Record<ZekeMood, StateId> = {
  idle: "idle",
  thinking: "thinking",
  working: "thinking",
  waiting: "notify",
  blocked: "alert",
  done: "wink",
  alert: "alert",
  notify: "notify",
  celebrate: "burst",
  curious: "wide",
};

const EXPRESSION_OF: Record<ZekeMood, string> = {
  idle: "attentif",
  thinking: "attentif",
  working: "attentif",
  waiting: "curieux",
  blocked: "mefiant",
  done: "heureux",
  alert: "colere",
  notify: "attentif",
  celebrate: "excite",
  curious: "curieux",
};

/** Subtle face changes while nothing is happening, so the character keeps breathing. */
const IDLE_EXPRESSIONS = ["attentif", "curieux", "neutre", "attentif", "somnolent"];
const random = (min: number, max: number) => min + Math.random() * (max - min);

interface ZekeBotProps {
  state: ZekeMood;
  size: number;
  expression?: string;
  follow?: boolean;
  decorative?: boolean;
  className?: string;
}

/** React renderer for Bloub's MIT-licensed, clock-free SVG engine. */
export function ZekeBot({ state, size, expression, follow = false, decorative = false, className }: ZekeBotProps) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const shape = SHAPE_BY_ID.get("nuage")?.radii ?? null;
  const baseExpressionId = expression ?? EXPRESSION_OF[state];
  const engine = useMemo(
    () => new BotEngine(RAYON, STATE_OF[state], shape, EXPRESSION_BY_ID.get(baseExpressionId) ?? null),
    [], // one engine per mount; later changes go through setters
  );
  const svgRef = useRef<SVGSVGElement>(null);
  const clock = useRef(0);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const aimSince = useRef(0);
  const aiming = useRef(false);
  const nextExpression = useRef(random(4, 8));
  const [frame, setFrame] = useState<BotFrame>(() => engine.sample(0));

  // State and expression changes are dated on the engine's own clock so fades blend.
  useEffect(() => {
    engine.setState(STATE_OF[state], clock.current);
    engine.setExpression(EXPRESSION_BY_ID.get(baseExpressionId) ?? null, clock.current);
  }, [engine, state, baseExpressionId]);

  useEffect(() => {
    if (!follow || reduce) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer.current = { x: event.clientX, y: event.clientY };
    };
    const onLeave = () => {
      pointer.current = null;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [follow, reduce]);

  useEffect(() => {
    if (reduce) {
      setFrame(engine.sample(0));
      return;
    }
    let raf = 0;
    let last = performance.now();
    let lastPaint = 0;
    const tick = (now: number) => {
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      clock.current += delta;

      if (state === "idle" && clock.current >= nextExpression.current) {
        const next = IDLE_EXPRESSIONS[Math.floor(Math.random() * IDLE_EXPRESSIONS.length)];
        engine.setExpression(EXPRESSION_BY_ID.get(next) ?? null, clock.current);
        nextExpression.current = clock.current + random(4, 8);
      }

      const baseFace = STATE_BY_ID.get(STATE_OF[state])?.baseFace ?? false;
      if (follow && baseFace) {
        const box = svgRef.current?.getBoundingClientRect();
        if (box && box.width && box.height) {
          if (!aiming.current) aimSince.current = clock.current;
          const look: Look = lookTarget({
            nx: pointer.current ? clamp((pointer.current.x - (box.left + box.width / 2)) / Math.max(1, window.innerWidth / 2), -1, 1) : 0,
            ny: pointer.current ? clamp((pointer.current.y - (box.top + box.height / 2)) / Math.max(1, window.innerHeight / 2), -1, 1) : 0,
            tour: easings.easeOutQuint(clamp((clock.current - aimSince.current) / TURN_TIME)),
            pointer: pointer.current !== null,
          });
          engine.setLook(look, clock.current);
          aiming.current = true;
        }
      } else if (aiming.current) {
        engine.setLook(null, clock.current, TURN_TIME);
        aiming.current = false;
      }

      if (now - lastPaint >= 28) {
        lastPaint = now;
        setFrame(engine.sample(clock.current));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [engine, follow, state, reduce]);

  // Bloub's engine mixes concrete hex colours for depth; keep those fixed and let the
  // backing paper follow the theme so the eyes read correctly in light and dark mode.
  const paper = "#ffffff";
  const ink = "#e8483f";
  const themedPaper = "var(--color-background-full)";
  const maskId = `zeke-mask-${uid}`;
  const viewBox = `${-DEMI_VIEWBOX} ${-DEMI_VIEWBOX} ${DEMI_VIEWBOX * 2} ${DEMI_VIEWBOX * 2}`;

  const dotAttrs = (dot: BotFrame["dots"][number]) => {
    const fill = dot.color ?? (dot.depth === undefined ? ink : mixHex(paper, ink, dot.depth));
    const common = { fill, opacity: dot.opacity };
    return dot.d
      ? { ...common, d: dot.d, transform: `translate(${dot.x} ${dot.y}) rotate(${dot.rot ?? 0}) scale(${RAYON})` }
      : { ...common, cx: dot.x, cy: dot.y, r: dot.r };
  };

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={viewBox}
      className={className}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={-DEMI_VIEWBOX} y={-DEMI_VIEWBOX} width={DEMI_VIEWBOX * 2} height={DEMI_VIEWBOX * 2}>
          <path d={frame.bodyPath} fill="#fff" />
          {frame.eyes.map((eye, i) => (
            <path key={i} d={eye.d} transform={eye.matrix} opacity={eye.alpha} fill="#000" />
          ))}
          {frame.notch ? <circle cx={frame.notch.x} cy={frame.notch.y} r={frame.notch.r} fill="#000" /> : null}
        </mask>
        {frame.arcs.map((arc) => (
          <linearGradient
            key={arc.id}
            id={`${uid}-${arc.id}`}
            gradientUnits="userSpaceOnUse"
            x1={arc.grad.x1}
            y1={arc.grad.y1}
            x2={arc.grad.x2}
            y2={arc.grad.y2}
          >
            {arc.grad.stops.map((c, i) => (
              <stop key={i} offset={i / (arc.grad.stops.length - 1)} stopColor={c} />
            ))}
          </linearGradient>
        ))}
      </defs>

      <g fill="none" strokeLinecap="round">
        {frame.arcs.map((arc) => (
          <path key={`b${arc.id}`} d={arc.back} stroke={`url(#${uid}-${arc.id})`} strokeWidth={arc.width} opacity={arc.opacity} />
        ))}
      </g>

      {frame.dotsBehind ? (
        <g>
          {frame.dots.map((dot, i) => {
            const attrs = dotAttrs(dot);
            return dot.d ? <path key={`pb${i}`} {...attrs} /> : <circle key={`pb${i}`} {...attrs} />;
          })}
        </g>
      ) : null}

      <g opacity={frame.bodyAlpha}>
        <path d={frame.bodyPath} fill={themedPaper} />
        <g mask={`url(#${maskId})`}>
          <rect x={-DEMI_VIEWBOX} y={-DEMI_VIEWBOX} width={DEMI_VIEWBOX * 2} height={DEMI_VIEWBOX * 2} fill={ink} />
        </g>
      </g>

      {!frame.dotsBehind ? (
        <g>
          {frame.dots.map((dot, i) => {
            const attrs = dotAttrs(dot);
            return dot.d ? <path key={`pf${i}`} {...attrs} /> : <circle key={`pf${i}`} {...attrs} />;
          })}
        </g>
      ) : null}

      {frame.notif ? <circle cx={frame.notif.x} cy={frame.notif.y} r={frame.notif.r} fill={NOTIF_BLUE} /> : null}

      <g fill="none" strokeLinecap="round">
        {frame.arcs.map((arc) => (
          <path key={`f${arc.id}`} d={arc.front} stroke={`url(#${uid}-${arc.id})`} strokeWidth={arc.width} opacity={arc.opacity} />
        ))}
      </g>
    </svg>
  );
}
