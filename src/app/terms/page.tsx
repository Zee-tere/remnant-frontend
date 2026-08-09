import Link from "next/link";
import { ArrowRight, BadgeCheck, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const terms = [
  {
    title: "Use the platform honestly",
    body:
      "Listings and messages should be accurate, lawful, and respectful of other members.",
  },
  {
    title: "Arrange exchanges directly",
    body:
      "Remnant does not process payment or provide escrow. Both people arrange payment, collection, or delivery themselves. Never share passwords, one-time codes, card PINs, or unnecessary financial information.",
  },
  {
    title: "Respect items and people",
    body:
      "Do not list unsafe goods, counterfeit items, stolen property, or content that violates another person's rights.",
  },
  {
    title: "Marketplace, not a party to the deal",
    body:
      "Remnant helps people discover listings and communicate. Remnant is not the buyer, seller, repairer, recycler, carrier, payment provider, or guarantor, and does not inspect or take possession of listed items.",
  },
  {
    title: "Guest listings use direct contact",
    body:
      "You may list without an account by providing a WhatsApp number, email address, or Telegram username that will be public on the listing. Your private management link controls listing changes, so keep it private. Guests contacting registered sellers send a one-time message and contact detail; the seller replies outside Remnant.",
  },
  {
    title: "Moderation and reports",
    body:
      "You can report listings, users, or conversations. We may restrict accounts, remove content, preserve safety records, or cooperate with lawful requests. Do not misuse reporting, harass others, scrape the service, evade controls, or upload malicious content.",
  },
  {
    title: "Eligibility and responsibility",
    body:
      "Use Remnant only if you can legally enter the arrangement you propose. You are responsible for item legality, accuracy, condition, ownership, taxes, delivery, meetings, and any direct payment. Minors should use the service only with a parent or guardian responsible for the exchange.",
  },
  {
    title: "Service availability and liability",
    body:
      "The service may change, pause, or contain errors. To the extent permitted by law, Remnant is provided without guarantees about users, listings, matches, availability, or completed exchanges. Nothing here excludes rights or liability that cannot legally be excluded.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-5 py-16 text-center md:px-8 md:py-24">
        <div className="icon-frame mx-auto mb-6 h-14 w-14 text-[var(--brand)]">
          <FileText size={28} aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] md:text-6xl">Terms of Service</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-8 text-[var(--ink-soft)]">
          The basic rules for buying, selling, trading, donating, repairing, and recycling through Remnant.
        </p>
        <p className="mt-3 text-sm font-semibold text-[var(--muted-foreground)]">Effective 8 August 2026</p>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
        <div className="grid border-y border-[var(--line-soft)] md:grid-cols-2 lg:grid-cols-3">
          {terms.map((term) => (
            <article key={term.title} className="border-b border-[var(--line-soft)] py-7 md:px-8 md:py-9">
              <div className="icon-frame mb-6 text-[var(--brand)]">
                <BadgeCheck size={24} aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">{term.title}</h2>
              <p className="mt-3 font-medium leading-7 text-[var(--ink-soft)]">{term.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-[var(--line-soft)] bg-[var(--cream)] p-7 text-center md:p-10">
          <ShieldCheck className="mx-auto text-[var(--secondary-blue)]" size={30} aria-hidden="true" />
          <h2 className="mt-4 text-3xl font-bold text-[var(--foreground)]">Need help with an exchange?</h2>
          <p className="mx-auto mt-3 max-w-xl font-medium leading-7 text-[var(--ink-soft)]">
            The Help Centre explains support channels and safe exchange basics.
          </p>
          <Button asChild className="mt-6 bg-[var(--brand)] px-7 font-bold text-white hover:bg-[var(--brand-dark)]">
            <Link href="/help">
              Visit Help Centre
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
