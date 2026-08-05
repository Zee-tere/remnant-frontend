import * as React from "react";
import { cn } from "@/lib/utils";

function Field({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

function FieldLabel({
  className,
  optional,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { optional?: boolean }) {
  return (
    <label className={cn("flex items-baseline justify-between gap-3 text-sm font-bold", className)} {...props}>
      <span>{children}</span>
      {optional && <span className="text-xs font-medium text-muted-foreground">Optional</span>}
    </label>
  );
}

function FieldHint({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs leading-5 text-muted-foreground", className)} {...props} />;
}

function FieldError({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p role="alert" className={cn("text-xs font-semibold leading-5 text-destructive", className)} {...props} />;
}

export { Field, FieldLabel, FieldHint, FieldError };
