import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[112px] w-full rounded-control border border-input bg-white px-4 py-3 text-base font-medium text-foreground transition-[border-color,box-shadow] duration-150 placeholder:font-normal placeholder:text-muted-foreground",
          "hover:border-[var(--brand)]/35 focus-visible:border-[var(--brand)] focus-visible:outline-none focus-visible:ring-0",
          "aria-invalid:border-destructive aria-invalid:outline aria-invalid:outline-2 aria-invalid:outline-offset-1 aria-invalid:outline-destructive/25 disabled:cursor-not-allowed disabled:opacity-50",
          "resize-y",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
