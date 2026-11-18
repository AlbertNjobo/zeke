import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/*
 * One button system: rounded-field (12px), pressable (hover steps 1px up, press scales .985),
 * focus ring from the global :focus-visible outline (2px action colour, never animated).
 * Exactly one filled variant marks the main action in a view; outline and ghost are secondary.
 */
const buttonVariants = cva(
  "pressable inline-flex shrink-0 items-center justify-center gap-2 rounded-field text-sm leading-5 font-medium whitespace-nowrap outline-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-z-evergreen text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-[#104635]",
        destructive: "bg-destructive text-white hover:bg-[#9c211a]",
        outline:
          "border border-z-line bg-z-panel text-z-ink hover:border-[#d4d5d2] hover:bg-z-hover",
        secondary: "bg-z-hover text-z-ink hover:bg-[#e2e2df]",
        ghost: "text-z-ink-2 hover:bg-z-hover hover:text-z-ink",
        link: "text-z-evergreen underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 has-[>svg]:px-3",
        xs: "h-7 gap-1 rounded-ctrl px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 rounded-field px-6 has-[>svg]:px-4",
        icon: "size-10",
        "icon-xs": "size-7 rounded-ctrl [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
