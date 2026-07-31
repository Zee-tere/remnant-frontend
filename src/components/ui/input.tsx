import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full !rounded-lg border border-input bg-background px-4 py-2 text-base font-medium text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground",
          "focus-visible:border-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--brand)] focus-visible:ring-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "touch-manipulation",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
