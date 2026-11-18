"use client";

import { RiArrowUpLine } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { InputBase, TextField } from "@/components/base/input/input";
import { cx } from "@/utils/cx";

interface ComposerProps {
  placeholder: string;
  hint?: string;
  className?: string;
}

/**
 * Message box for Zeke. Sending opens the live agent chat (/s), where the eve agent answers.
 * The typed text is carried over so the conversation starts from it.
 */
export function Composer({ placeholder, hint, className }: ComposerProps) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function send() {
    const text = value.trim();
    router.push(text ? `/s?q=${encodeURIComponent(text)}` : "/s");
  }

  return (
    <form
      className={cx(
        "flex flex-col gap-2 rounded-3xl border border-border-button-default bg-background-primary-default p-2 ps-4 shadow-sm",
        className,
      )}
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
    >
      <TextField aria-label="Message Zeke" value={value} onChange={setValue} className="flex-1">
        <InputBase
          placeholder={placeholder}
          fieldClassName="border-0 bg-transparent shadow-none px-0 focus-within:ring-0"
          className="text-headline-regular"
          trailingAddon={<Button type="submit" iconOnly leadingIcon={RiArrowUpLine} aria-label="Send to Zeke" />}
        />
      </TextField>
      {hint ? <p className="px-0 pb-1 text-caption-1-regular text-text-secondary">{hint}</p> : null}
    </form>
  );
}
