import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepTrackerProps {
  steps: string[];
  currentStep: number;
}

export function StepTracker({ steps, currentStep }: StepTrackerProps) {
  return (
    <div className="flex items-center px-1 py-4 border-b border-border">
      {steps.map((label, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            {/* Step indicator + label */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-7 h-7 flex items-center justify-center text-[10px] font-mono font-bold border transition-colors",
                  isCompleted &&
                    "bg-primary border-primary text-primary-foreground",
                  isCurrent &&
                    "border-primary text-primary bg-primary/10",
                  !isCompleted &&
                    !isCurrent &&
                    "border-border text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[9px] font-mono font-medium uppercase tracking-wider whitespace-nowrap",
                  isCurrent ? "text-primary" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mx-2 mt-[-18px]",
                  i < currentStep ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
