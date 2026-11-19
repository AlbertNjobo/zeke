"use client";

import { useEffect, useState } from "react";
import { Select, SelectItem } from "@/components/base/select/select";
import { EXPRESSIONS } from "@/components/zeke/bot/expressions";
import { getLook, loadLook, setLook, subscribeLook, type CharacterLook } from "@/components/zeke/bot/look";
import { COLORS, SHAPES } from "@/components/zeke/bot/skins";
import { ZekeFace } from "@/components/zeke/zeke-face";

const label = (id: string) => id.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

const COLOR_OPTIONS = [{ id: "", label: "Theme accent" }, ...COLORS.map((c) => ({ id: c.id, label: label(c.id) }))];
const SHAPE_OPTIONS = SHAPES.map((s) => ({ id: s.id, label: label(s.id) }));
const EXPRESSION_OPTIONS = EXPRESSIONS.map((e) => ({ id: e.id, label: label(e.id) }));

export function CharacterSettings() {
  const [look, setLocal] = useState<CharacterLook>(() => {
    loadLook();
    return { ...getLook() };
  });

  useEffect(() => subscribeLook((next) => setLocal({ ...next })), []);

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-border-button-default bg-background-primary-default p-5">
      <div className="flex items-center gap-4">
        <ZekeFace state="idle" expression={look.expression} size={64} />
        <div className="flex flex-col gap-1">
          <h2 className="text-headline-medium">Make Zeke yours</h2>
          <p className="text-body-2-regular text-text-secondary">Shape, colour and resting expression are saved on this device.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Select label="Shape" selectedKey={look.shape} onSelectionChange={(key) => setLook({ shape: String(key) })}>
          {SHAPE_OPTIONS.map((item) => (
            <SelectItem key={item.id} id={item.id} textValue={item.label}>{item.label}</SelectItem>
          ))}
        </Select>
        <Select label="Colour" selectedKey={look.color} onSelectionChange={(key) => setLook({ color: String(key) })}>
          {COLOR_OPTIONS.map((item) => (
            <SelectItem key={item.id} id={item.id} textValue={item.label}>{item.label}</SelectItem>
          ))}
        </Select>
        <Select
          label="Resting expression"
          selectedKey={look.expression}
          onSelectionChange={(key) => setLook({ expression: String(key) })}
        >
          {EXPRESSION_OPTIONS.map((item) => (
            <SelectItem key={item.id} id={item.id} textValue={item.label}>{item.label}</SelectItem>
          ))}
        </Select>
      </div>
    </section>
  );
}
