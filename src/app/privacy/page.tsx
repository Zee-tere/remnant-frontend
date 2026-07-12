import Link from "next/link";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    title: "What we collect",
    body:
      "We collect the account details, listing content, messages, transaction status, and support information needed to run Remnant safely.",
  },
  {
    title: "How we use it",
    body:
      "We use platform data to operate search, AI pairing, trust checks, support, and product improvements.",
  },
  {
    title: "Your choices",
    body:
      "You can update your profile, change notifications, remove listings, or contact support for account and data requests.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-5 py-16 text-center md:px-8 md:py-24">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
          <Lock size={28} aria-hidden="true" />
        </div>
        <h1 className="text-5xl font-bold text-[var(--foreground)] md:text-6xl">Privacy Policy</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-8 text-[var(--ink-soft)]">
          A clear summary of how Remnant handles personal information, listing data, and transaction records.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {sections.map((section) => (
            <article key={section.title} className="surface-card rounded-[2rem] p-7">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
                <ShieldCheck size={24} aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">{section.title}</h2>
              <p className="mt-3 font-medium leading-7 text-[var(--ink-soft)]">{section.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-[2rem] border border-[var(--border)]/50 bg-[var(--cream)] p-7 text-center md:p-10">
          <Mail className="mx-auto text-[var(--secondary-blue)]" size={30} aria-hidden="true" />
          <h2 className="mt-4 text-3xl font-bold text-[var(--foreground)]">Privacy questions</h2>
          <p className="mx-auto mt-3 max-w-xl font-medium leading-7 text-[var(--ink-soft)]">
            Email support for data access, correction, deletion, or privacy questions.
          </p>
          <Button asChild className="mt-6 rounded-full bg-[var(--brand)] px-7 font-bold text-white hover:bg-[var(--brand-dark)]">
            <Link href="mailto:support@remnant.africa">
              Contact support
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
