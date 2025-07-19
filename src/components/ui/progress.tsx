
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indicatorClassName?: string;
    size?: "sm" | "md" | "lg";
    variant?: "default" | "success" | "warning" | "danger" | "info" | "gradient";
    showValue?: boolean;
    formatValue?: (value: number) => string;
    animated?: boolean;
  }
>(({ className, value, indicatorClassName, size = "md", variant = "default", showValue = false, formatValue, animated = false, ...props }, ref) => {
  const getHeight = () => {
    switch (size) {
      case "sm": return "h-1.5";
      case "lg": return "h-3";
      default: return "h-2"; // md
    }
  };

  const getVariantStyle = () => {
    switch (variant) {
      case "success": return "bg-emerald-500";
      case "warning": return "bg-amber-500";
      case "danger": return "bg-red-500";
      case "info": return "bg-blue-500";
      case "gradient": return "bg-gradient-to-r from-indigo-500 to-purple-500";
      default: return "bg-primary";
    }
  };

  return (
    <div className={cn("flex items-center gap-2 w-full", className)}>
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-muted",
          getHeight()
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full transition-all origin-left",
            getVariantStyle(),
            animated && "animate-pulse",
            indicatorClassName
          )}
          style={{ transform: `scaleX(${(value || 0) / 100})` }}
        />
      </ProgressPrimitive.Root>
      {showValue && (
        <div className="text-xs font-medium tabular-nums">
          {formatValue ? formatValue(value || 0) : `${Math.round(value || 0)}%`}
        </div>
      )}
    </div>
  );
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
