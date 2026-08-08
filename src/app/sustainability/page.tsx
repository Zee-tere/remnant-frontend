import Link from "next/link";
import { ArrowRight, Recycle, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionArtwork } from "@/components/brand/ActionArtwork";

const impactAreas = [
  {
    title: "Reuse first",
    body:
      "Pass on what still works before it becomes waste. A clear listing helps the right person find it.",
  },
  {
    title: "Match the odd pieces",
    body:
      "A model, size, side, or small detail can connect an odd piece with the person missing it.",
  },
  {
    title: "Recycle with intent",
    body:
      "When the whole item cannot be reused, its parts and materials can still reach a repairer, maker, or recycler.",
  },
];

export default function SustainabilityPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-5 py-16 text-center md:px-8 md:py-24">
        <ActionArtwork name="recycle" priority className="mx-auto mb-6 h-[5.5rem] w-[5.5rem] md:mb-7 md:h-44 md:w-44" />
        <h1 className="text-3xl font-bold text-[var(--foreground)] md:text-6xl">Use what already exists.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-8 text-[var(--ink-soft)]">
          Find the missing piece, or pass on what still works. Small exchanges keep useful things in use for longer.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
        <div className="grid border-y border-[var(--line-soft)] md:grid-cols-3 md:divide-x md:divide-[var(--line-soft)]">
          {impactAreas.map((area) => (
            <article key={area.title} className="border-b border-[var(--line-soft)] py-7 last:border-b-0 md:border-b-0 md:px-8 md:py-9">
              <div className="icon-frame mb-6 text-[var(--brand)]">
                <Recycle size={24} aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">{area.title}</h2>
              <p className="mt-3 font-medium leading-7 text-[var(--ink-soft)]">{area.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-[var(--line-soft)] bg-[var(--cream)] p-7 text-center md:p-10">
          <ScanSearch className="mx-auto text-[var(--secondary-blue)]" size={30} aria-hidden="true" />
          <h2 className="mt-4 text-3xl font-bold text-[var(--foreground)]">Start with one piece</h2>
          <p className="mx-auto mt-3 max-w-xl font-medium leading-7 text-[var(--ink-soft)]">
            List something incomplete, search for a match, or browse items already waiting for their next use.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className="bg-[var(--brand)] px-7 font-bold text-white hover:bg-[var(--brand-dark)]">
              <Link href="/sell-item">
                List an item
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-[var(--border)] bg-white px-7 font-bold text-[var(--brand)] hover:bg-[var(--brand-soft)]">
              <Link href="/marketplace">Browse marketplace</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
