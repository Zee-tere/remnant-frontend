'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center px-5 py-12 text-center">
      <h1 className="text-3xl font-bold">We couldn’t open this page</h1>
      <p className="mt-4 text-[var(--muted-foreground)]">Try loading it again. You can also return to the marketplace and continue browsing.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline"><Link href="/marketplace">Back to the market</Link></Button>
      </div>
    </section>
  );
}
