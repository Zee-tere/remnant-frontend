"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search, Package, MapPin, Filter,
  RefreshCw, HandHeart, Wrench, Recycle, DollarSign, Loader2,
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
  slug: string;
  user?: { id: string; name: string; avatarUrl: string | null; trustTier: string };
}

const intentionMeta: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  SELL: { icon: DollarSign, label: "For Sale", color: "text-emerald-700" },
  TRADE: { icon: RefreshCw, label: "Trade", color: "text-blue-600" },
  DONATE: { icon: HandHeart, label: "Free", color: "text-amber-600" },
  FIX: { icon: Wrench, label: "Needs Fix", color: "text-orange-600" },
  RECYCLE: { icon: Recycle, label: "Recycle", color: "text-teal-600" },
};

const conditionLabels: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};

const categories = [
  "Electronics & Gadgets", "Clothing & Fashion", "Shoes & Footwear",
  "Accessories & Jewelry", "Furniture & Home Decor", "Kitchen & Home Essentials",
  "Vehicles & Auto Parts", "Tools & DIY", "Sports & Outdoor",
  "Books & Education", "Toys & Games", "Other",
];

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [category, setCategory] = useState("");
  const [intentionTag, setIntentionTag] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: page.toString(), limit: "12" };
      if (searchTerm) params.search = searchTerm;
      if (category) params.category = category;
      if (intentionTag) params.intentionTag = intentionTag;

      const data = await listingsApi.getListings(params);
      setListings(data.listings || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, category, intentionTag]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchListings();
  };

  return (
    <div className="min-h-screen py-6 md:py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
            The marketplace
          </h1>
          <p className="text-neutral-500">
            Browse incomplete, broken, and singular things waiting for their next purpose.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <Input
                type="text"
                placeholder="Search for items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-neutral-200 focus:border-[#4a7c6f] focus:ring-[#4a7c6f]/20"
              />
            </div>
            <Button type="submit" className="bg-[#4a7c6f] hover:bg-[#3d6b5f] text-white">
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-neutral-200 md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
            </Button>
          </form>

          {/* Filter Row */}
          <div className={`flex flex-wrap gap-2 ${showFilters ? 'block' : 'hidden md:flex'}`}>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4a7c6f] bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={intentionTag}
              onChange={(e) => { setIntentionTag(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4a7c6f] bg-white"
            >
              <option value="">All Intents</option>
              <option value="SELL">For Sale</option>
              <option value="TRADE">For Trade</option>
              <option value="DONATE">Free / Donate</option>
              <option value="FIX">Needs Repair</option>
              <option value="RECYCLE">Recycle</option>
            </select>

            {(category || intentionTag || searchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setCategory(""); setIntentionTag(""); setSearchTerm(""); setPage(1); }}
                className="text-neutral-500 text-sm"
              >
                Clear filters
              </Button>
            )}

            <span className="ml-auto text-sm text-neutral-400 self-center">
              {total} item{total !== 1 && 's'} found
            </span>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-[#4a7c6f]" />
          </div>
        ) : listings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {listings.map((item) => {
                const intent = intentionMeta[item.intentionTag] || intentionMeta.SELL;
                const IntentIcon = intent.icon;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -3 }}
                    className="group"
                  >
                    <Card className="overflow-hidden border border-neutral-100 hover:border-[#4a7c6f]/30 hover:shadow-lg transition-all duration-300">
                      <div className="relative aspect-square overflow-hidden bg-neutral-50">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-200">
                            <Package size={48} />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm ${intent.color}`}>
                            <IntentIcon size={12} />
                            {intent.label}
                          </span>
                        </div>
                        {item.condition && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
                              {conditionLabels[item.condition] || item.condition}
                            </span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-1 text-sm">
                          {item.title}
                        </h3>
                        <p className="text-xs text-neutral-400 line-clamp-2 mb-3">
                          {item.description}
                        </p>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm text-neutral-500">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#4a7c6f]/10 mb-4">
              <Package className="text-[#4a7c6f]" size={28} />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-neutral-900">No items found</h3>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
              {searchTerm || category || intentionTag
                ? "Try adjusting your filters or search for something else."
                : "The marketplace is empty! Be the first to list an item."}
            </p>
            <Link href="/sell-item">
              <Button className="bg-[#4a7c6f] hover:bg-[#3d6b5f] text-white">
                List the first item
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
