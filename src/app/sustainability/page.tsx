import Link from "next/link";
import { ArrowRight, Leaf, Recycle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const impactAreas = [
  {
    title: "Reuse first",
    body:
      "Remnant helps members find buyers, trades, donations, and repairs before useful objects become waste.",
  },
  {
    title: "Match the odd pieces",
    body:
      "AI pairing gives single, mismatched, or incomplete items a real route to the people who can use them.",
  },
  {
    title: "Recycle with intent",
    body:
      "When an item cannot be reused, listing intent keeps recyclable parts visible instead of hidden in drawers.",
  },
];

export default function SustainabilityPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-5 py-16 text-center md:px-8 md:py-24">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
          <Leaf size={28} aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] md:text-6xl">Sustainability</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-8 text-[var(--ink-soft)]">
          Remnant is built for the useful things that usually fall through the cracks of ordinary marketplaces.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {impactAreas.map((area) => (
            <article key={area.title} className="surface-card rounded-[2rem] p-7">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
                <Recycle size={24} aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">{area.title}</h2>
              <p className="mt-3 font-medium leading-7 text-[var(--ink-soft)]">{area.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-[2rem] border border-[var(--border)]/50 bg-[var(--cream)] p-7 text-center md:p-10">
          <Sparkles className="mx-auto text-[var(--secondary-blue)]" size={30} aria-hidden="true" />
          <h2 className="mt-4 text-3xl font-bold text-[var(--foreground)]">Start with one piece</h2>
          <p className="mx-auto mt-3 max-w-xl font-medium leading-7 text-[var(--ink-soft)]">
            List something incomplete, search for a match, or browse items already waiting for their next use.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className="rounded-full bg-[var(--brand)] px-7 font-bold text-white hover:bg-[var(--brand-dark)]">
              <Link href="/sell-item">
                List an item
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-[var(--border)] bg-white px-7 font-bold text-[var(--brand)] hover:bg-[var(--brand-soft)]">
              <Link href="/marketplace">Browse marketplace</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
