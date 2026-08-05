import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-12 w-full rounded-control border border-input bg-white px-4 text-base font-medium text-foreground outline-none transition-[border-color,box-shadow,background-color] duration-150",
        "hover:border-[var(--brand)]/35 focus-visible:border-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--brand)]/25",
        "aria-invalid:border-destructive aria-invalid:outline-destructive/25 disabled:cursor-not-allowed disabled:bg-[var(--sand)] disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";

export { Select };
