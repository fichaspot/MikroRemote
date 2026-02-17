import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-semibold uppercase tracking-wider transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/85 active:scale-[0.98]",
        destructive: "bg-primary text-primary-foreground hover:bg-primary/85",
        outline: "border border-border bg-transparent text-foreground hover:bg-accent hover:border-foreground/20",
        secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-accent hover:border-foreground/20",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-accent",
        link: "text-primary underline-offset-4 hover:underline tracking-normal font-medium",
      },
      size: {
        default: "h-9 px-5 py-2",
        sm: "h-7 px-3 text-[10px]",
        lg: "h-10 px-8",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
