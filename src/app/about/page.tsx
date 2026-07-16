'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Puzzle, Shield, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const values = [
  {
    icon: Heart,
    title: 'Nothing useful is worthless',
    description: 'A cracked device has parts. A single shoe has a match. A lonely lid can complete a set.',
  },
  {
    icon: Shield,
    title: 'Trust makes reuse possible',
    description: 'Profiles and direct messages help buyers and sellers agree on an exchange.',
  },
  {
    icon: Users,
    title: 'Community completes the loop',
    description: 'Remnant works because people are willing to share the odd pieces most marketplaces ignore.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-5 py-14 text-center md:px-8 md:py-28">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)]/55 bg-white px-4 py-2 text-xs font-bold text-[var(--brand)] soft-shadow md:mb-6 md:text-sm">
            <Puzzle size={16} aria-hidden="true" />
            Our story
          </div>
          <h1 className="mx-auto max-w-4xl text-[1.85rem] font-bold leading-tight text-[var(--foreground)] md:text-7xl">
            Every piece still has a purpose.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-6 text-[var(--ink-soft)] md:mt-7 md:text-lg md:leading-8">
            Remnant helps incomplete, broken, or singular things find someone who can use them.
          </p>
        </motion.div>
      </section>

      <section className="bg-[var(--cream)] px-5 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)] md:text-4xl">A clearer route for the pieces in the drawer.</h2>
            <div className="mt-6 space-y-4 text-base font-medium leading-8 text-[var(--ink-soft)]">
              <p>
                Look in any drawer, closet, or garage. There is usually one earring, a lone shoe,
                a remote without its device, or a gadget with one working part left.
              </p>
              <p>
                Remnant connects people who have those items with people who need them. Members can sell,
                trade, donate, repair, or recycle with intent made clear from the start.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '5', label: 'Intent tags', sub: 'Sell, trade, donate, repair, recycle' },
              { value: 'AI', label: 'Matching', sub: 'Finds complementary needs' },
              { value: '0', label: 'Listing fee', sub: 'Free to post' },
              { value: 'Safe', label: 'Trust', sub: 'Profiles and clear records' },
            ].map((stat) => (
              <div key={stat.label} className="surface-card rounded-[2rem] p-5">
                <p className="text-3xl font-bold text-[var(--brand)]">{stat.value}</p>
                <p className="mt-1 text-sm font-bold text-[var(--foreground)]">{stat.label}</p>
                <p className="mt-1 text-xs font-medium text-[var(--muted-foreground)]">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-[var(--foreground)] md:text-4xl">What drives us</h2>
          <p className="mt-3 font-medium text-[var(--ink-soft)]">Our principles shape every feature we build.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {values.map((value) => (
            <div key={value.title} className="surface-card lift-card rounded-[2rem] p-7">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
                <value.icon size={24} aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)] md:text-2xl">{value.title}</h3>
              <p className="mt-3 font-medium leading-7 text-[var(--ink-soft)]">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[var(--cream)] px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-[var(--foreground)] md:text-4xl">How Remnant Works</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-5">
            {[
              'List the item',
              'Choose intent',
              'AI scans matches',
              'Connect safely',
              'Complete the exchange',
            ].map((title, index) => (
              <div key={title} className="text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white soft-shadow">
                  {index + 1}
                </div>
                <h3 className="text-base font-bold text-[var(--foreground)]">{title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 text-center md:px-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-[var(--brand)] p-8 text-white soft-shadow md:p-12">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
            <Sparkles size={28} aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold md:text-4xl">Give your items a second life.</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            Join the community that turns forgotten things into found ones.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className="bg-white px-7 font-bold text-[var(--brand)] hover:bg-[var(--brand-container)]">
              <Link href="/signup">Get started free</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/60 bg-transparent px-7 font-bold text-white hover:bg-white hover:text-[var(--brand)]">
              <Link href="/marketplace">
                Browse marketplace
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
