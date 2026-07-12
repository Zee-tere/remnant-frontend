import Link from "next/link";
import { ArrowRight, BadgeCheck, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const terms = [
  {
    title: "Use the platform honestly",
    body:
      "Listings, messages, and transaction updates should be accurate, lawful, and respectful of other members.",
  },
  {
    title: "Complete paid exchanges safely",
    body:
      "When money changes hands, use the protected Remnant transaction flow so order status and release steps are recorded.",
  },
  {
    title: "Respect items and people",
    body:
      "Do not list unsafe goods, counterfeit items, stolen property, or content that violates another person's rights.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-5 py-16 text-center md:px-8 md:py-24">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
          <FileText size={28} aria-hidden="true" />
        </div>
        <h1 className="text-5xl font-bold text-[var(--foreground)] md:text-6xl">Terms of Service</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-8 text-[var(--ink-soft)]">
          The basic rules for buying, selling, trading, donating, repairing, and recycling through Remnant.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {terms.map((term) => (
            <article key={term.title} className="surface-card rounded-[2rem] p-7">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
                <BadgeCheck size={24} aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">{term.title}</h2>
              <p className="mt-3 font-medium leading-7 text-[var(--ink-soft)]">{term.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-[2rem] border border-[var(--border)]/50 bg-[var(--cream)] p-7 text-center md:p-10">
          <ShieldCheck className="mx-auto text-[var(--secondary-blue)]" size={30} aria-hidden="true" />
          <h2 className="mt-4 text-3xl font-bold text-[var(--foreground)]">Need help with a transaction?</h2>
          <p className="mx-auto mt-3 max-w-xl font-medium leading-7 text-[var(--ink-soft)]">
            The Help Center explains payment states, support channels, and safe exchange basics.
          </p>
          <Button asChild className="mt-6 rounded-full bg-[var(--brand)] px-7 font-bold text-white hover:bg-[var(--brand-dark)]">
            <Link href="/help">
              Visit Help Center
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
