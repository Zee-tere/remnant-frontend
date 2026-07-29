import { cn } from '@/lib/utils';

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
      <span className="loading-orbit" aria-hidden="true" />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid auto-rows-fr grid-cols-2 gap-1.5 sm:gap-2 md:grid-cols-3 md:gap-4 xl:grid-cols-4" role="status" aria-label="Loading marketplace items" aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-lg border border-[var(--border)] bg-white">
          <div className="skeleton aspect-[5/3] md:aspect-[5/4]" />
          <div className="space-y-2 p-2 md:p-4">
            <div className="skeleton h-5 w-4/5 rounded-full" />
            <div className="skeleton h-4 w-2/5 rounded-full" />
            <div className="skeleton h-3 w-3/5 rounded-full" />
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
        <div className="skeleton h-3 w-28 rounded-full" />
        <div className="skeleton h-9 w-52 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="min-h-28 rounded-lg border border-[var(--border)] bg-white p-4 md:rounded-xl">
            <div className="skeleton h-3 w-20 rounded-full" />
            <div className="skeleton mt-4 h-7 w-12 rounded-full" />
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
    <div className="min-h-[70dvh] bg-[var(--background)] px-4 py-5 md:px-8 md:py-10" role="status" aria-label="Loading page" aria-busy="true">
      <span className="sr-only">Loading page</span>
      <div className="mx-auto max-w-7xl">
        <div className="loading-panel relative overflow-hidden rounded-xl border border-[var(--border)] px-5 py-10 md:px-10 md:py-14">
          <div className="skeleton h-3 w-36 rounded-full" />
          <div className="skeleton mt-5 h-11 max-w-lg rounded-full md:h-16" />
          <div className="skeleton mt-4 h-4 max-w-sm rounded-full" />
        </div>
        <div className="mt-8">
          <ListingGridSkeleton count={4} />
        </div>
      </div>
    </div>
  );
}
