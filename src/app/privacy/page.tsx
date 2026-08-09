import Link from "next/link";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    title: "What we collect",
    body:
      "We collect account details when you register; a display name, selected public contact method, and private management token when you list as a guest; listings, images, messages, reports, support requests, device and security logs, and coarse location you choose to provide.",
  },
  {
    title: "How we use it",
    body:
      "We use this information to publish listings, enforce compatibility rules, deliver private messages, prevent abuse, answer support, maintain security and reliability, and understand aggregate product performance. We do not sell personal information.",
  },
  {
    title: "Your choices",
    body:
      "Your profile is private by default. You control whether it is public and whether your state is shown. Account holders can export or schedule deletion in Settings; guest sellers can delete listings and guest data through their private management link or support.",
  },
  {
    title: "Sharing and service providers",
    body:
      "We share only what is needed with infrastructure, identity, storage, database, email, monitoring, and matching providers that operate Remnant. Listings, enabled public profile fields, and the WhatsApp, email, or Telegram contact chosen by a guest seller are public. A guest buyer's contact is shown only to the registered seller they message and authorized moderation staff.",
  },
  {
    title: "Retention and security",
    body:
      "We retain active account and marketplace data while the service is used, security and moderation records as reasonably necessary, pending uploads for up to 24 hours, and deletion requests for a 30-day retention window before anonymization. We use access controls, encryption in transit, scoped guest links, validation, rate limits, logs, and backups, but no online service is risk-free.",
  },
  {
    title: "Cookies and browser storage",
    body:
      "Remnant uses necessary browser storage for authenticated sessions, guest listing management links, preferences, and fraud prevention. Guest listing management belongs to the browser holding the private link or token; clearing browser data can make it unavailable. We do not use advertising cookies in this release.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-5 py-16 text-center md:px-8 md:py-24">
        <div className="icon-frame mx-auto mb-6 h-14 w-14 text-[var(--brand)]">
          <Lock size={28} aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] md:text-6xl">Privacy Policy</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-8 text-[var(--ink-soft)]">
          A clear summary of how Remnant handles personal information, listings, messages, and support records.
        </p>
        <p className="mt-3 text-sm font-semibold text-[var(--muted-foreground)]">Effective 8 August 2026</p>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
        <div className="grid border-y border-[var(--line-soft)] md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <article key={section.title} className="border-b border-[var(--line-soft)] py-7 md:px-8 md:py-9">
              <div className="icon-frame mb-6 text-[var(--brand)]">
                <ShieldCheck size={24} aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">{section.title}</h2>
              <p className="mt-3 font-medium leading-7 text-[var(--ink-soft)]">{section.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-[var(--line-soft)] bg-[var(--cream)] p-7 text-center md:p-10">
          <Mail className="mx-auto text-[var(--secondary-blue)]" size={30} aria-hidden="true" />
          <h2 className="mt-4 text-3xl font-bold text-[var(--foreground)]">Privacy questions</h2>
          <p className="mx-auto mt-3 max-w-xl font-medium leading-7 text-[var(--ink-soft)]">
            Use the Help Centre queue or email support for access, correction, deletion, objection, or privacy questions. Include enough information to locate your data, but never send a password or verification code.
          </p>
          <Button asChild className="mt-6 bg-[var(--brand)] px-7 font-bold text-white hover:bg-[var(--brand-dark)]">
            <Link href="mailto:support@remnantmarket.co">
              Contact support
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
