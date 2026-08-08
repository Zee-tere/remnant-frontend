'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionArtwork } from '@/components/brand/ActionArtwork';

const values = [
  {
    icon: Heart,
    title: 'Nothing useful is worthless',
    description: 'A cracked device has parts. A single shoe has a match. A lonely lid can complete a set.',
  },
  {
    icon: Shield,
    title: 'Clear details build trust',
    description: 'Profiles, honest photos, and direct messages help both people agree with confidence.',
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
          <h1 className="mx-auto max-w-4xl text-[1.85rem] font-bold leading-tight text-[var(--foreground)] md:text-7xl">
            Find the missing piece. Pass on what still works.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-6 text-[var(--ink-soft)] md:mt-7 md:text-lg md:leading-8">
            Remnant connects the useful things people have with the exact things other people need.
          </p>
          <ActionArtwork name="marketplace" priority className="mx-auto mt-8 h-24 w-24 md:mt-10 md:h-52 md:w-52" />
        </motion.div>
      </section>

      <section className="bg-[var(--cream)] px-5 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)] md:text-4xl">The odd piece in your drawer may be exactly what someone needs.</h2>
            <div className="mt-6 space-y-4 text-base font-medium leading-8 text-[var(--ink-soft)]">
              <p>
                Look in any drawer, closet, or garage. There is usually one earring, a lone shoe,
                a remote without its device, or a gadget with one working part left.
              </p>
              <p>
                List it clearly, find the right person, and arrange the exchange directly. Sell, trade,
                donate, repair, or recycle—the intent is clear from the start.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '5', label: 'Intent tags', sub: 'Sell, trade, donate, repair, recycle' },
              { value: 'Pair', label: 'Matching', sub: 'Connects complementary needs' },
              { value: 'Direct', label: 'Exchange', sub: 'You agree together' },
              { value: 'Clear', label: 'Trust', sub: 'Profiles, photos, messages' },
            ].map((stat) => (
              <div key={stat.label} className="border-t border-[var(--border)]/70 py-5">
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

        <div className="grid border-y border-[var(--line-soft)] md:grid-cols-3 md:divide-x md:divide-[var(--line-soft)]">
          {values.map((value) => (
            <div key={value.title} className="border-b border-[var(--line-soft)] p-6 last:border-b-0 md:border-b-0 md:p-8">
              <div className="icon-frame mb-5 h-11 w-11" data-preserve-icon-frame>
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
              'Remnant checks matches',
              'Message the person',
              'Agree and exchange',
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
        <div className="mx-auto max-w-3xl rounded-2xl bg-[var(--brand)] p-8 text-white md:p-12">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
            <Heart size={28} aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold md:text-4xl">Someone may be looking for what you have.</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            List it clearly and help the right person find it.
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
