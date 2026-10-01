import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center px-5 py-12 text-center">
      <p className="text-sm font-bold text-[var(--brand)]">404 · Page not found</p>
      <h1 className="mt-3 text-3xl font-bold">This piece is missing</h1>
      <p className="mt-4 text-[var(--muted-foreground)]">The link may have changed, or this listing may no longer be available. Explore the market to find something useful.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild><Link href="/marketplace">Explore the market</Link></Button>
        <Button asChild variant="outline"><Link href="/">Go home</Link></Button>
      </div>
    </section>
  );
}
