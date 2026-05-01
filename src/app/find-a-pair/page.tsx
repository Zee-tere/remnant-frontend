"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search, Package, Sparkles, Loader2,
  RefreshCw, HandHeart, Wrench, Recycle, DollarSign, MapPin, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { listingsApi } from "@/lib/api";

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  intentionTag: string;
  price: string | null;
  images: string[];
  city: string | null;
  pairingKeyword: string | null;
}

const intentionMeta: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  SELL: { icon: DollarSign, label: "For Sale", color: "text-emerald-700" },
  TRADE: { icon: RefreshCw, label: "Trade", color: "text-blue-600" },
  DONATE: { icon: HandHeart, label: "Free", color: "text-amber-600" },
  FIX: { icon: Wrench, label: "Needs Fix", color: "text-orange-600" },
  RECYCLE: { icon: Recycle, label: "Recycle", color: "text-teal-600" },
};

export default function FindAPairPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listingsApi.getListings({ limit: "20" })
      .then((data: { listings: Listing[] }) => {
        setListings(data.listings || []);
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const params: Record<string, string> = { limit: "20" };
    if (searchTerm) params.search = searchTerm;
    listingsApi.getListings(params)
      .then((data: { listings: Listing[] }) => setListings(data.listings || []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen py-6 md:py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4a7c6f]/10 text-[#4a7c6f] text-sm font-medium mb-4">
            <Sparkles size={16} />
            <span>Smart matching</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">
            Find the other half
          </h1>
          <p className="text-neutral-500 max-w-lg mx-auto">
            Search for items that complement what you have. Left AirPod? We&apos;ll find a right one.
            Missing a shoe? Someone has it.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <Input
                type="text"
                placeholder="Describe what you're looking for — e.g. 'right AirPod Pro 2nd gen'"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-neutral-200 focus:border-[#4a7c6f] focus:ring-[#4a7c6f]/20"
              />
            </div>
            <Button type="submit" className="h-12 px-6 bg-[#4a7c6f] hover:bg-[#3d6b5f] text-white">
              <Search className="mr-2" size={16} />
              Find
            </Button>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-[#4a7c6f]" />
          </div>
        ) : listings.length > 0 ? (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">
                {searchTerm ? `Results for "${searchTerm}"` : "Browse available items"}
              </h2>
              <span className="text-sm text-neutral-400">{listings.length} items</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((item) => {
                const intent = intentionMeta[item.intentionTag] || intentionMeta.SELL;
                const IntentIcon = intent.icon;
                return (
                  <motion.div key={item.id} whileHover={{ y: -3 }} className="group">
                    <Card className="overflow-hidden border border-neutral-100 hover:border-[#4a7c6f]/30 hover:shadow-lg transition-all duration-300">
                      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-50">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-200">
                            <Package size={40} />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm ${intent.color}`}>
                            <IntentIcon size={12} />
                            {intent.label}
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-1 text-sm">{item.title}</h3>
                        <p className="text-xs text-neutral-400 line-clamp-2 mb-3">{item.description}</p>
                        {item.pairingKeyword && (
                          <p className="text-xs text-[#4a7c6f] bg-[#4a7c6f]/10 px-2 py-1 rounded-full inline-block mb-3">
                            Pairs with: {item.pairingKeyword}
                          </p>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-[#4a7c6f] font-bold text-sm">
                            {item.price ? `₦${Number(item.price).toLocaleString()}` : 'Free'}
                          </span>
                          {item.city && (
                            <span className="text-xs text-neutral-400 flex items-center gap-1">
                              <MapPin size={10} />
                              {item.city}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#4a7c6f]/10 mb-4">
              <Sparkles className="text-[#4a7c6f]" size={28} />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-neutral-900">No matches yet</h3>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
              {searchTerm
                ? "No items match your search. Try different keywords or browse all listings."
                : "List your item first, and our engine will automatically search for matches."}
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/sell-item">
                <Button className="bg-[#4a7c6f] hover:bg-[#3d6b5f] text-white">
                  List an item
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="outline" className="gap-2">
                  Browse marketplace
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
