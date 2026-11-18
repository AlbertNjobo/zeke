import * as React from "react";

import { cn } from "@/lib/utils";

/*
 * One field system: rounded-field (12px), 44px tall on a phone (44px tap target), 40px on a
 * desktop pointer. Focus: the action border and a soft ring in 140ms (fields carry their own
 * focus treatment, so the global outline stays off them).
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-field border border-input bg-z-panel px-3.5 py-2 text-base leading-6 text-z-ink transition-[border-color,box-shadow] duration-150 outline-none selection:bg-z-evergreen selection:text-white placeholder:text-z-muted disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:text-sm",
        "focus:border-z-evergreen focus:ring-4 focus:ring-z-evergreen/10",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
