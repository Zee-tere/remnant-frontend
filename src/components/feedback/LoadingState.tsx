import { cn } from '@/lib/utils';

export function LoadingMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={cn('remnant-loader', compact && 'remnant-loader--compact')} aria-hidden="true">
      <span className="remnant-loader__dot remnant-loader__dot--one" />
      <span className="remnant-loader__dot remnant-loader__dot--two" />
      <span className="remnant-loader__dot remnant-loader__dot--three" />
    </span>
  );
}

export function LoadingState({
  label = 'Loading',
  className,
  compact = false,
}: {
  label?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center text-[var(--ink-soft)]',
        compact ? 'min-h-40 gap-3' : 'min-h-[22rem] gap-4',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingMark compact={compact} />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid auto-rows-fr grid-cols-3 gap-2 md:gap-4 xl:grid-cols-4" role="status" aria-label="Loading marketplace items" aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border border-[var(--border)]/70 bg-white md:rounded-2xl">
          <div className="skeleton aspect-[4/3] md:aspect-[5/4]" />
          <div className="space-y-1.5 p-2 md:space-y-2 md:p-4">
            <div className="skeleton h-3 w-4/5 rounded-sm md:h-5" />
            <div className="skeleton h-2.5 w-2/5 rounded-sm md:h-4" />
            <div className="skeleton h-2 w-3/5 rounded-sm md:h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSectionLoading({ label = 'Loading your dashboard' }: { label?: string }) {
  return (
    <div className="space-y-6" role="status" aria-label={label} aria-busy="true">
      <span className="sr-only">{label}</span>
      <div className="space-y-3">
        <div className="skeleton h-3 w-28 rounded-sm" />
        <div className="skeleton h-9 w-52 rounded-md" />
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="min-h-28 rounded-lg border border-[var(--border)] bg-white p-4 md:rounded-xl">
            <div className="skeleton h-3 w-20 rounded-sm" />
            <div className="skeleton mt-4 h-7 w-12 rounded-md" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-white p-4 md:rounded-xl">
        <div className="skeleton h-11 w-full rounded-xl" />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="skeleton h-44 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PageLoadingShell() {
  return (
    <div className="page-loading-shell" role="status" aria-label="Loading page" aria-busy="true">
      <span className="sr-only">Loading page</span>
      <div className="page-loading-shell__content">
        <LoadingMark />
        <p>Getting things ready</p>
      </div>
    </div>
  );
}
