import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full !rounded-control border border-input bg-white px-4 py-2 text-base font-medium text-foreground transition-[border-color,box-shadow,background-color] duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:font-normal placeholder:text-muted-foreground",
          "hover:border-[var(--brand)]/35 focus-visible:border-[var(--brand)] focus-visible:outline-none focus-visible:ring-0",
          "aria-invalid:border-destructive aria-invalid:outline aria-invalid:outline-2 aria-invalid:outline-offset-1 aria-invalid:outline-destructive/25 disabled:cursor-not-allowed disabled:bg-[var(--sand)] disabled:opacity-60",
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
