import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cloud-btn cloud-btn-sm rounded-none text-center",
  {
    variants: {
      variant: {
        default: "",
        destructive: "rounded-full bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 px-4 py-2 text-sm",
        outline: "cloud-btn cloud-btn-outline",
        secondary: "rounded-full bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 px-4 py-2 text-sm",
        ghost: "rounded-full hover:bg-accent hover:text-accent-foreground px-3 py-2 text-sm",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "",
        sm: "cloud-btn-sm",
        lg: "cloud-btn-lg",
        icon: "h-9 w-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
