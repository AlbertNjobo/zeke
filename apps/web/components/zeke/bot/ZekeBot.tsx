"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { NOTIF_BLUE } from "./decor";
import { BotEngine, type BotFrame } from "./engine";
import { EXPRESSION_BY_ID } from "./expressions";
import { lookTarget, TURN_TIME } from "./gaze";
import { getLook, loadLook, subscribeLook, type CharacterLook } from "./look";
import { clamp, easings } from "./math";
import { DEMI_VIEWBOX, RAYON } from "./repere";
import { mixHex, SHAPE_BY_ID } from "./skins";
import { STATE_BY_ID, type StateId } from "./states";
import { useThemeInk } from "./theme-ink";
import type { ZekeMood } from "@/lib/zeke/views";

const STATE_OF: Record<ZekeMood, StateId> = {
  idle: "idle",
  thinking: "thinking",
  working: "play",
  waiting: "notify",
  blocked: "exclaim",
  done: "wink",
  alert: "exclaim",
  notify: "notify",
  celebrate: "burst",
  curious: "wide",
};

const EXPRESSION_OF: Record<ZekeMood, string> = {
  idle: "attentif",
  thinking: "attentif",
  working: "attentif",
  waiting: "curieux",
  blocked: "colere",
  done: "heureux",
  alert: "colere",
  notify: "attentif",
  celebrate: "excite",
  curious: "curieux",
};

/** Weighted idle pool; gaze drift and blinking remain the main source of life. */
const IDLE_EXPRESSIONS = ["attentif", "attentif", "curieux", "neutre", "somnolent"];
const REACTIONS: ZekeMood[] = ["waiting", "blocked", "alert", "notify", "celebrate", "curious"];
const MAX_ARCS = 6;
const MAX_DOTS = 8;
const MAX_STOPS = 8;
const MAX_EYES = 2;
const REACTION_MS = 4_000;
const SLEEP_AFTER_S = 30;
const random = (min: number, max: number) => min + Math.random() * (max - min);

const attr = (el: Element | null, values: Record<string, string | number>) => {
  if (!el) return;
  for (const [key, value] of Object.entries(values)) el.setAttribute(key, String(value));
};
const show = (el: Element | null, visible: boolean) => {
  if (el) (el as HTMLElement).style.display = visible ? "" : "none";
};

interface ZekeBotProps {
  state: ZekeMood;
  size: number;
  expression?: string;
  follow?: boolean;
  decorative?: boolean;
  className?: string;
}

/** Direct-DOM React renderer for Bloub's MIT-licensed, clock-free SVG engine. */
export function ZekeBot({ state, size, expression, follow = false, decorative = false, className }: ZekeBotProps) {
  const reduce = useReducedMotion();
  const [, bumpLook] = useState(0);
  const uid = useId().replace(/:/g, "");
  const themeInk = useThemeInk("#e8483f");
  const lookRef = useRef<CharacterLook>(getLook());
  const ink = lookRef.current.color || themeInk;
  const inkRef = useRef(ink);
  inkRef.current = ink;

  const baseExpressionId = expression ?? EXPRESSION_OF[state];
  const engine = useMemo(
    () => new BotEngine(RAYON, STATE_OF[state], SHAPE_BY_ID.get(lookRef.current.shape)?.radii ?? null, EXPRESSION_BY_ID.get(baseExpressionId) ?? null),
    [], // one engine per mount; later changes go through setters
  );
  const initialFrame = useMemo(() => engine.sample(0), [engine]);

  const svgRef = useRef<SVGSVGElement>(null);
  const bodyMaskRef = useRef<SVGPathElement>(null);
  const eyeMaskRefs = useRef<(SVGPathElement | null)[]>([]);
  const notchMaskRef = useRef<SVGCircleElement>(null);
  const bodyPaperRef = useRef<SVGPathElement>(null);
  const bodyGroupRef = useRef<SVGGElement>(null);
  const notifRef = useRef<SVGCircleElement>(null);
  const gradRefs = useRef<(SVGLinearGradientElement | null)[]>([]);
  const stopRefs = useRef<Array<(SVGStopElement | null)[]>>([]);
  const arcBackRefs = useRef<(SVGPathElement | null)[]>([]);
  const arcFrontRefs = useRef<(SVGPathElement | null)[]>([]);
  const dotPathRefs = useRef<Array<(SVGPathElement | null)[]>>([[], []]);
  const dotCircleRefs = useRef<Array<(SVGCircleElement | null)[]>>([[], []]);
  const dotGroupRefs = useRef<(SVGGElement | null)[]>([]);

  const clock = useRef(0);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const aimSince = useRef(0);
  const aiming = useRef(false);
  const nextExpression = useRef(random(6, 11));
  const lastStateChange = useRef(0);
  const reactionUntil = useRef(0);
  const reverted = useRef(false);
  const sleeping = useRef(false);

  /** Write one sampled frame straight into the SVG; no React render per frame. */
  const applyFrame = useCallback((frame: BotFrame) => {
    attr(bodyMaskRef.current, { d: frame.bodyPath });
    attr(bodyPaperRef.current, { d: frame.bodyPath });
    attr(bodyGroupRef.current, { opacity: frame.bodyAlpha });

    for (let i = 0; i < MAX_EYES; i++) {
      const eye = frame.eyes[i];
      const el = eyeMaskRefs.current[i];
      if (eye && el) {
        attr(el, { d: eye.d, transform: eye.matrix, opacity: eye.alpha });
        show(el, true);
      } else show(el, false);
    }
    if (notchMaskRef.current) {
      if (frame.notch) {
        attr(notchMaskRef.current, { cx: frame.notch.x, cy: frame.notch.y, r: frame.notch.r });
        show(notchMaskRef.current, true);
      } else show(notchMaskRef.current, false);
    }

    for (let i = 0; i < MAX_ARCS; i++) {
      const arc = frame.arcs[i];
      const back = arcBackRefs.current[i];
      const front = arcFrontRefs.current[i];
      const grad = gradRefs.current[i];
      if (!arc) {
        show(back, false);
        show(front, false);
        show(grad, false);
        continue;
      }
      show(back, true);
      show(front, true);
      show(grad, true);
      attr(grad, { id: `${uid}-arc-${i}`, x1: arc.grad.x1, y1: arc.grad.y1, x2: arc.grad.x2, y2: arc.grad.y2 });
      attr(back, { d: arc.back, "stroke-width": arc.width, opacity: arc.opacity, stroke: `url(#${uid}-arc-${i})` });
      attr(front, { d: arc.front, "stroke-width": arc.width, opacity: arc.opacity, stroke: `url(#${uid}-arc-${i})` });
      for (let j = 0; j < MAX_STOPS; j++) {
        const stop = stopRefs.current[i]?.[j];
        const color = arc.grad.stops[j];
        if (stop && color) {
          attr(stop, { offset: j / Math.max(1, arc.grad.stops.length - 1), "stop-color": color, "stop-opacity": 1 });
        } else if (stop) attr(stop, { "stop-opacity": 0 });
      }
    }

    for (let group = 0; group < 2; group++) {
      show(dotGroupRefs.current[group], group === (frame.dotsBehind ? 0 : 1));
      for (let i = 0; i < MAX_DOTS; i++) {
        const dot = frame.dots[i];
        const path = dotPathRefs.current[group][i];
        const circle = dotCircleRefs.current[group][i];
        if (!dot) {
          show(path, false);
          show(circle, false);
          continue;
        }
        const fill = dot.color ?? (dot.depth === undefined ? inkRef.current : mixHex("#ffffff", inkRef.current, dot.depth));
        if (dot.d) {
          attr(path, {
            d: dot.d,
            transform: `translate(${dot.x} ${dot.y}) rotate(${dot.rot ?? 0}) scale(${RAYON})`,
            fill,
            opacity: dot.opacity,
          });
          show(path, true);
          show(circle, false);
        } else {
          attr(circle, { cx: dot.x, cy: dot.y, r: dot.r, fill, opacity: dot.opacity });
          show(circle, true);
          show(path, false);
        }
      }
    }

    if (notifRef.current) {
      if (frame.notif) {
        attr(notifRef.current, { cx: frame.notif.x, cy: frame.notif.y, r: frame.notif.r, fill: NOTIF_BLUE });
        show(notifRef.current, true);
      } else show(notifRef.current, false);
    }
  }, [uid]);

  // Load persisted look and react to settings changes.
  useEffect(() => {
    loadLook();
    return subscribeLook((next) => {
      lookRef.current = next;
      engine.setShape(SHAPE_BY_ID.get(next.shape)?.radii ?? null, clock.current);
      const expr = expression ?? next.expression;
      engine.setExpression(EXPRESSION_BY_ID.get(expr) ?? null, clock.current);
      if (sleeping.current) {
        engine.setState("idle", clock.current);
        sleeping.current = false;
      }
      bumpLook((n) => n + 1);
    });
  }, [engine, expression]);

  // App state changes become engine transitions, dated on the engine clock.
  useEffect(() => {
    lastStateChange.current = clock.current;
    reverted.current = false;
    reactionUntil.current = REACTIONS.includes(state) ? clock.current + REACTION_MS / 1000 : 0;
    sleeping.current = false;
    engine.setState(STATE_OF[state], clock.current);
    engine.setExpression(EXPRESSION_BY_ID.get(baseExpressionId) ?? null, clock.current);
  }, [engine, state, baseExpressionId]);

  useEffect(() => {
    if (!follow || reduce) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer.current = { x: event.clientX, y: event.clientY };
      if (sleeping.current) {
        engine.setState("idle", clock.current);
        sleeping.current = false;
        lastStateChange.current = clock.current;
      }
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
  }, [engine, follow, reduce]);

  useEffect(() => {
    if (reduce) {
      applyFrame(engine.sample(0));
      return;
    }
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      clock.current += delta;

      if (state === "idle" && !sleeping.current && clock.current - lastStateChange.current > SLEEP_AFTER_S) {
        engine.setState("sleep", clock.current);
        sleeping.current = true;
      }
      if (reactionUntil.current && clock.current >= reactionUntil.current && !reverted.current) {
        engine.setState("idle", clock.current);
        engine.setExpression(EXPRESSION_BY_ID.get(lookRef.current.expression) ?? null, clock.current);
        reverted.current = true;
      }
      if (state === "idle" && !sleeping.current && lookRef.current.expression === "attentif" && clock.current >= nextExpression.current) {
        const next = IDLE_EXPRESSIONS[Math.floor(Math.random() * IDLE_EXPRESSIONS.length)];
        engine.setExpression(EXPRESSION_BY_ID.get(next) ?? null, clock.current);
        nextExpression.current = clock.current + random(6, 11);
      }

      const baseFace = STATE_BY_ID.get(STATE_OF[state])?.baseFace ?? false;
      if (follow && baseFace) {
        const box = svgRef.current?.getBoundingClientRect();
        if (box && box.width && box.height) {
          if (!aiming.current) aimSince.current = clock.current;
          engine.setLook(
            lookTarget({
              nx: pointer.current ? clamp((pointer.current.x - (box.left + box.width / 2)) / Math.max(1, window.innerWidth / 2), -1, 1) : 0,
              ny: pointer.current ? clamp((pointer.current.y - (box.top + box.height / 2)) / Math.max(1, window.innerHeight / 2), -1, 1) : 0,
              tour: easings.easeOutQuint(clamp((clock.current - aimSince.current) / TURN_TIME)),
              pointer: pointer.current !== null,
            }),
            clock.current,
          );
          aiming.current = true;
        }
      } else if (aiming.current) {
        engine.setLook(null, clock.current, TURN_TIME);
        aiming.current = false;
      }

      applyFrame(engine.sample(clock.current));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [applyFrame, engine, follow, state, reduce]);

  const maskId = `zeke-mask-${uid}`;
  const viewBox = `${-DEMI_VIEWBOX} ${-DEMI_VIEWBOX} ${DEMI_VIEWBOX * 2} ${DEMI_VIEWBOX * 2}`;
  const dotSlots = Array.from({ length: MAX_DOTS }, (_, i) => i);
  const arcSlots = Array.from({ length: MAX_ARCS }, (_, i) => i);

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
          <path ref={bodyMaskRef} d={initialFrame.bodyPath} fill="#fff" />
          {Array.from({ length: MAX_EYES }, (_, i) => (
            <path
              key={i}
              ref={(el) => {
                eyeMaskRefs.current[i] = el;
              }}
              d={initialFrame.eyes[i]?.d}
              transform={initialFrame.eyes[i]?.matrix}
              opacity={initialFrame.eyes[i]?.alpha}
              fill="#000"
              style={{ display: initialFrame.eyes[i] ? undefined : "none" }}
            />
          ))}
          <circle ref={notchMaskRef} fill="#000" style={{ display: "none" }} />
        </mask>
        {arcSlots.map((i) => (
          <linearGradient
            key={i}
            ref={(el) => {
              gradRefs.current[i] = el;
            }}
            id={`${uid}-arc-${i}`}
            gradientUnits="userSpaceOnUse"
            style={{ display: "none" }}
          >
            {Array.from({ length: MAX_STOPS }, (_, j) => (
              <stop
                key={j}
                ref={(el) => {
                  (stopRefs.current[i] ??= [])[j] = el;
                }}
                offset="0"
                stopColor="#fff"
                stopOpacity={0}
              />
            ))}
          </linearGradient>
        ))}
      </defs>

      <g fill="none" strokeLinecap="round">
        {arcSlots.map((i) => (
          <path
            key={`b${i}`}
            ref={(el) => {
              arcBackRefs.current[i] = el;
            }}
            style={{ display: "none" }}
          />
        ))}
      </g>

      {[0, 1].map((group) => (
        <g
          key={group}
          ref={(el) => {
            dotGroupRefs.current[group] = el;
          }}
          style={{ display: group === (initialFrame.dotsBehind ? 0 : 1) ? undefined : "none" }}
        >
          {dotSlots.map((i) => (
            <g key={i}>
              <path
                ref={(el) => {
                  dotPathRefs.current[group][i] = el;
                }}
                style={{ display: "none" }}
              />
              <circle
                ref={(el) => {
                  dotCircleRefs.current[group][i] = el;
                }}
                style={{ display: "none" }}
              />
            </g>
          ))}
        </g>
      ))}

      <g ref={bodyGroupRef} opacity={initialFrame.bodyAlpha}>
        <path ref={bodyPaperRef} d={initialFrame.bodyPath} style={{ fill: "var(--color-background-full)" }} />
        <g mask={`url(#${maskId})`}>
          <rect x={-DEMI_VIEWBOX} y={-DEMI_VIEWBOX} width={DEMI_VIEWBOX * 2} height={DEMI_VIEWBOX * 2} style={{ fill: ink }} />
        </g>
      </g>

      <circle ref={notifRef} fill={NOTIF_BLUE} style={{ display: "none" }} />

      <g fill="none" strokeLinecap="round">
        {arcSlots.map((i) => (
          <path
            key={`f${i}`}
            ref={(el) => {
              arcFrontRefs.current[i] = el;
            }}
            style={{ display: "none" }}
          />
        ))}
      </g>
    </svg>
  );
}
