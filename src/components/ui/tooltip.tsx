import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

function Tooltip({ content, children, side = "right" }: TooltipProps) {
  const [show, setShow] = React.useState(false);

  const posClass = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }[side];

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className={cn(
            "absolute z-50 whitespace-nowrap bg-[#1a1a1a] border border-border px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground shadow-lg",
            posClass
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export { Tooltip };
