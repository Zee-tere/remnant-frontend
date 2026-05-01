'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Heart, Shield, Users, Puzzle, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 md:py-24 px-4 text-center bg-gradient-to-br from-[#f0f7f4] via-white to-[#e8f0ec]">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4a7c6f]/10 text-[#4a7c6f] text-sm font-medium mb-6">
            <Puzzle size={16} />
            <span>Our story</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
            We believe every piece
            <br />
            still has a purpose
          </h1>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            Remnant is the marketplace for incomplete, broken, or singular things.
            We exist because too many useful items get discarded simply because one piece is missing.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-6">
                Stop throwing things away because one piece is missing.
              </h2>
              <div className="space-y-4 text-neutral-500 leading-relaxed">
                <p>
                  Look in any drawer, closet, or garage — there&apos;s always that single earring,
                  the lone shoe, the remote without a device, the gadget with a cracked screen.
                  These items still have value.
                </p>
                <p>
                  Remnant connects people who have singular, incomplete, or broken items with people
                  who need them. Whether you want to sell, trade, donate, get something repaired,
                  or recycle responsibly — we make it possible with five simple intention tags.
                </p>
                <p>
                  We&apos;re building a circular economy where nothing goes to waste unnecessarily.
                  Every worn-out gadget has parts someone can use. Every single shoe has a match
                  waiting to be found.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "5", label: "Intention Tags", sub: "Sell, Trade, Donate, Fix, Recycle" },
                { value: "AI", label: "Matching Engine", sub: "Finds the other half automatically" },
                { value: "₦0", label: "Listing Fee", sub: "Free to post, you only pay when sold" },
                { value: "4%", label: "Transaction Fee", sub: "Only charged on completed sales" },
              ].map((stat) => (
                <Card key={stat.label} className="border border-neutral-100">
                  <CardContent className="p-5">
                    <p className="text-2xl font-bold text-[#4a7c6f] mb-1">{stat.value}</p>
                    <p className="text-sm font-medium text-neutral-900">{stat.label}</p>
                    <p className="text-xs text-neutral-400 mt-1">{stat.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20 px-4 bg-[#fafbfa]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">What drives us</h2>
            <p className="text-neutral-500">Our principles shape every feature we build.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Heart,
                title: "Nothing is worthless",
                description: "If it exists, someone can use it. A cracked screen has circuits. A single shoe has a match. We see value where others see waste.",
              },
              {
                icon: Shield,
                title: "Trust is earned",
                description: "Our trust tier system, verified identities, and secure escrow payments mean every transaction is safe and transparent.",
              },
              {
                icon: Users,
                title: "Community first",
                description: "We're building more than a marketplace — we're creating a community of people who believe in giving every piece a second chance.",
              },
            ].map((value) => (
              <Card key={value.title} className="border border-neutral-100 hover:border-[#4a7c6f]/30 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-7">
                  <div className="w-12 h-12 rounded-xl bg-[#4a7c6f]/10 flex items-center justify-center mb-5">
                    <value.icon className="text-[#4a7c6f]" size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">How Remnant works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: "1", title: "List your item", description: "Snap a photo, describe what you have, and choose a category." },
              { step: "2", title: "Choose your intent", description: "Sell, trade, donate, get it fixed, or recycle it." },
              { step: "3", title: "Our AI matches", description: "The matching engine scans listings for complementary items." },
              { step: "4", title: "Connect", description: "Chat with your match, agree on terms." },
              { step: "5", title: "Complete", description: "Use secure escrow or arrange a meetup." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-[#4a7c6f] text-white flex items-center justify-center text-sm font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1">{item.title}</h3>
                <p className="text-xs text-neutral-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-br from-[#4a7c6f] to-[#3d6b5f] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to give your items a second life?
          </h2>
          <p className="text-white/70 mb-8">
            Join the community that turns forgotten things into found ones.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-[#4a7c6f] hover:bg-white/90 font-semibold">
                Get started free
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
                Browse marketplace
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}