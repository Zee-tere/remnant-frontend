import { cn } from '@/lib/utils';

export function NairaIcon({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex shrink-0 items-center justify-center font-extrabold leading-none', className)}
      style={{ width: size, height: size, fontSize: Math.max(14, Math.round(size * 0.9)) }}
    >
      ₦
    </span>
  );
}
