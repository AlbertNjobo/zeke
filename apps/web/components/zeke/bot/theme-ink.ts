"use client";

import { useEffect, useState } from "react";

/** Resolve the theme's accent token to a concrete hex the Bloub colour mixer can use. */
export function useThemeInk(fallback: string) {
  const [ink, setInk] = useState(fallback);

  useEffect(() => {
    const resolve = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue("--color-accent-500").trim();
      if (!raw) return;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#000000";
      ctx.fillStyle = raw;
      const value = ctx.fillStyle;
      if (/^#[0-9a-f]{6}$/i.test(value)) setInk(value);
    };
    resolve();
    const observer = new MutationObserver(resolve);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return ink;
}
