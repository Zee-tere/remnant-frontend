'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search, Heart, Shield,
  Package, CheckCircle,
  ArrowRight, ChevronRight, Sparkles,
  Puzzle, Recycle, HandHeart, Wrench, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { listingsApi } from "@/lib/api";

interface Listing {
  id: string;
  title: string;
  category: string;
  price: string | null;
  images: string[];
  intentionTag: string;
  condition: string;
  city: string | null;
  user?: { name: string; avatarUrl: string | null };
}

const intentionIcons: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  SELL: { icon: Package, label: "For Sale", color: "text-emerald-700" },
  TRADE: { icon: RefreshCw, label: "For Trade", color: "text-blue-600" },
  DONATE: { icon: HandHeart, label: "Free / Donate", color: "text-amber-600" },
  FIX: { icon: Wrench, label: "Needs Repair", color: "text-orange-600" },
  RECYCLE: { icon: Recycle, label: "Recycle", color: "text-teal-600" },
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    listingsApi.getListings({ limit: '4' })
      .then((data: { listings: Listing[] }) => {
        setFeaturedListings(data.listings || []);
      })
      .catch(() => {})
      .finally(() => setLoadingListings(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-4 md:px-8 py-16 md:py-24 overflow-hidden">
        {/* Soft gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f0f7f4] via-white to-[#e8f0ec]" />
        
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#4a7c6f]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#6b9e8a]/5 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4a7c6f]/10 text-[#4a7c6f] text-sm font-medium mb-8">
              <Puzzle size={16} />
              <span>Every piece has a purpose</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-neutral-900">
              The marketplace for{" "}
              <span className="bg-gradient-to-r from-[#4a7c6f] to-[#6b9e8a] bg-clip-text text-transparent">
                incomplete, broken,
              </span>
              <br />
              or singular things
            </h1>

            <p className="text-lg md:text-xl text-neutral-500 mb-4 max-w-2xl mx-auto leading-relaxed">
              Stop throwing things away because one piece is missing.
            </p>
            <p className="text-base md:text-lg text-neutral-400 max-w-2xl mx-auto">
              Sell the single earring. Trade the lone shoe. Donate the spare part.
              Someone out there is looking for exactly what you have.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={22} />
              <Input
                type="text"
                placeholder="What are you looking for? Try 'left AirPod' or 'broken screen'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 md:h-16 pl-12 pr-32 md:pr-40 text-base md:text-lg rounded-2xl border-neutral-200 shadow-sm focus:border-[#4a7c6f] focus:ring-[#4a7c6f]/20"
              />
              <Button
                type="submit"
                className="absolute right-2 top-2 h-10 md:h-12 px-4 md:px-6 rounded-xl bg-[#4a7c6f] hover:bg-[#3d6b5f] text-white"
              >
                <Search className="mr-0 md:mr-2" size={18} />
                <span className="hidden md:inline">Search</span>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {["Single AirPod", "Lone shoe", "Broken screen", "Missing remote", "Spare parts"].map((tag) => (
                <Link key={tag} href={`/marketplace?search=${encodeURIComponent(tag)}`}>
                  <Button variant="outline" size="sm" className="rounded-full text-xs border-neutral-200 text-neutral-500 hover:border-[#4a7c6f] hover:text-[#4a7c6f]">
                    {tag}
                  </Button>
                </Link>
              ))}
            </div>
          </motion.form>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link href="/sell-item">
              <Button size="lg" className="h-12 md:h-14 px-6 md:px-8 rounded-xl text-base md:text-lg bg-[#4a7c6f] hover:bg-[#3d6b5f] text-white">
                <Package className="mr-2" size={20} />
                List your item — it&apos;s free
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="h-12 md:h-14 px-6 md:px-8 rounded-xl text-base md:text-lg border-2 border-neutral-200 hover:border-[#4a7c6f] hover:text-[#4a7c6f]">
                Browse the marketplace
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronRight className="rotate-90 text-neutral-300" size={24} />
        </motion.div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-900">
              From forgotten to found in four steps
            </h2>
            <p className="text-neutral-500 max-w-xl mx-auto">
              That drawer full of mismatched things? Someone needs exactly what&apos;s in it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Snap & list", description: "Photograph your item and describe what it is — single shoe, broken gadget, spare part, anything.", icon: Package, color: "#4a7c6f" },
              { step: "2", title: "Tag your intent", description: "Selling? Trading? Donating? Hoping someone can fix it? Tell us what you want to happen.", icon: Puzzle, color: "#5b8d7d" },
              { step: "3", title: "We find the match", description: "Our matching engine scans thousands of listings to find the other half, the buyer, or the fixer.", icon: Sparkles, color: "#6b9e8a" },
              { step: "4", title: "Connect & close", description: "Message your match, agree on terms, and complete the exchange securely.", icon: CheckCircle, color: "#4a7c6f" },
            ].map((item) => (
              <motion.div
                key={item.step}
                whileHover={{ y: -4 }}
                className="relative"
              >
                <Card className="h-full border border-neutral-100 hover:border-[#4a7c6f]/30 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-7">
                    <div
                      className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <span className="text-lg font-bold" style={{ color: item.color }}>
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-neutral-900">{item.title}</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
                {item.step !== "4" && (
                  <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 text-neutral-200">
                    <ArrowRight size={20} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What People List ─────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-[#fafbfa]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 text-neutral-900">
                Recently listed
              </h2>
              <p className="text-neutral-500">
                Real items from real people — each one waiting for its match.
              </p>
            </div>
            <Link href="/marketplace">
              <Button variant="outline" className="gap-2 border-neutral-200 hover:border-[#4a7c6f] hover:text-[#4a7c6f]">
                View all listings
                <ChevronRight size={16} />
              </Button>
            </Link>
          </div>

          {loadingListings ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square bg-neutral-100 animate-pulse" />
                  <CardContent className="p-5">
                    <div className="h-5 bg-neutral-100 rounded animate-pulse mb-3" />
                    <div className="h-4 bg-neutral-100 rounded animate-pulse w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredListings.map((item) => {
                const intention = intentionIcons[item.intentionTag] || intentionIcons.SELL;
                const IntentionIcon = intention.icon;
                return (
                  <motion.div key={item.id} whileHover={{ y: -4 }} className="group">
                    <Link href={`/marketplace`}>
                      <Card className="overflow-hidden border border-neutral-100 hover:border-[#4a7c6f]/30 transition-all duration-300 hover:shadow-lg">
                        <div className="relative aspect-square overflow-hidden bg-neutral-100">
                          {item.images && item.images.length > 0 ? (
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-300">
                              <Package size={48} />
                            </div>
                          )}
                          <div className="absolute top-3 left-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm ${intention.color}`}>
                              <IntentionIcon size={12} />
                              {intention.label}
                            </span>
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-1">{item.title}</h3>
                          <div className="flex justify-between items-center">
                            <span className="text-[#4a7c6f] font-bold">
                              {item.price ? `₦${Number(item.price).toLocaleString()}` : 'Free'}
                            </span>
                            {item.city && (
                              <span className="text-xs text-neutral-400">{item.city}</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#4a7c6f]/10 mb-4">
                <Package className="text-[#4a7c6f]" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-neutral-900">No listings yet</h3>
              <p className="text-neutral-500 mb-6">Be the first to list an item and start the movement.</p>
              <Link href="/sell-item">
                <Button className="bg-[#4a7c6f] hover:bg-[#3d6b5f] text-white">
                  List the first item
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Why Remnant ───────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-900">
              Built for things no one else will take
            </h2>
            <p className="text-neutral-500 max-w-xl mx-auto">
              Traditional marketplaces ignore incomplete items. We built Remnant because those things still have value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Safe & verified",
                description: "Every user earns trust through verified profiles, ratings, and secure escrow payments. No surprises.",
                features: ["Identity verification", "Buyer protection", "Secure escrow"],
              },
              {
                icon: Sparkles,
                title: "Smart matching",
                description: "Our engine doesn't just list items — it actively finds the other half. Left shoe, meet right shoe.",
                features: ["Automatic pair detection", "Category matching", "Keyword pairing"],
              },
              {
                icon: Heart,
                title: "More than selling",
                description: "Sell, trade, donate, or find someone to repair it. Five intention tags let you say exactly what you want.",
                features: ["Sell for cash", "Trade for something else", "Donate to someone in need"],
              },
            ].map((feature) => (
              <Card key={feature.title} className="border border-neutral-100 hover:border-[#4a7c6f]/30 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#4a7c6f]/10 mb-6">
                    <feature.icon className="text-[#4a7c6f]" size={26} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-neutral-900">{feature.title}</h3>
                  <p className="text-neutral-500 mb-6 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="space-y-2.5">
                    {feature.features.map((f) => (
                      <li key={f} className="flex items-center text-sm text-neutral-600">
                        <CheckCircle className="w-4 h-4 text-[#4a7c6f] mr-2.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-gradient-to-br from-[#4a7c6f] to-[#3d6b5f]">
        <div className="max-w-3xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              That single item in your drawer?
              <br />
              Someone is searching for it right now.
            </h2>
            <p className="text-lg mb-8 text-white/80">
              Join the community turning forgotten things into found ones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="h-14 px-8 rounded-xl text-lg bg-white text-[#4a7c6f] hover:bg-white/90 font-semibold">
                  Get started free
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="h-14 px-8 rounded-xl text-lg border-2 border-white/30 text-white hover:bg-white/10">
                  Learn what we&apos;re building
                </Button>
              </Link>
            </div>
            <p className="text-sm text-white/50 mt-6">
              Free to list · 4% fee only when you sell · No commitment
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}