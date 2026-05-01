"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, Package, MapPin, Loader2, MessageSquare,
  DollarSign, RefreshCw, HandHeart, Wrench, Recycle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listingsApi, conversationsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { toast } from "sonner";

interface ListingDetail {
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
  slug: string;
  user?: { id: string; name: string; avatarUrl: string | null; trustTier: string };
  createdAt: string;
}

const intentionMeta: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  SELL: { icon: DollarSign, label: "For Sale", color: "text-emerald-700" },
  TRADE: { icon: RefreshCw, label: "For Trade", color: "text-blue-600" },
  DONATE: { icon: HandHeart, label: "Free / Donate", color: "text-amber-600" },
  FIX: { icon: Wrench, label: "Needs Repair", color: "text-orange-600" },
  RECYCLE: { icon: Recycle, label: "Recycle", color: "text-teal-600" },
};

const conditionLabels: Record<string, string> = {
  NEW: "New", LIKE_NEW: "Like New", GOOD: "Good", FAIR: "Fair", POOR: "Poor / Broken",
};

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isAuthenticated } = useAuthStore();

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isMessaging, setIsMessaging] = useState(false);

  const handleMessageSeller = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!listing) return;
    setIsMessaging(true);
    try {
      await conversationsApi.startConversation(listing.id);
      toast.success('Conversation started!');
      router.push('/user/dashboard?section=messages');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not start conversation';
      toast.error(msg);
    } finally {
      setIsMessaging(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    listingsApi.getListing(id)
      .then((data: ListingDetail) => setListing(data))
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#4a7c6f]" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <Package className="text-neutral-300 mb-4" size={48} />
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">Item not found</h2>
        <p className="text-neutral-500 mb-6">This listing may have been removed or doesn&apos;t exist.</p>
        <Link href="/marketplace">
          <Button className="bg-[#4a7c6f] hover:bg-[#3d6b5f] text-white gap-2">
            <ArrowLeft size={16} />
            Back to marketplace
          </Button>
        </Link>
      </div>
    );
  }

  const intent = intentionMeta[listing.intentionTag] || intentionMeta.SELL;
  const IntentIcon = intent.icon;

  return (
    <div className="min-h-screen py-6 md:py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-6 transition-colors">
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square rounded-2xl overflow-hidden bg-neutral-100 mb-3"
            >
              {listing.images && listing.images.length > 0 ? (
                <img
                  src={listing.images[selectedImage]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-200">
                  <Package size={64} />
                </div>
              )}
            </motion.div>
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {listing.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      selectedImage === i ? 'border-[#4a7c6f]' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 ${intent.color}`}>
                <IntentIcon size={14} />
                {intent.label}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
                {conditionLabels[listing.condition] || listing.condition}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">{listing.title}</h1>

            <p className="text-2xl font-bold text-[#4a7c6f] mb-6">
              {listing.price ? `₦${Number(listing.price).toLocaleString()}` : 'Free'}
            </p>

            <div className="space-y-4 mb-8">
              <p className="text-neutral-600 leading-relaxed">{listing.description}</p>

              <div className="flex flex-wrap gap-3 text-sm text-neutral-500">
                {listing.category && (
                  <span className="flex items-center gap-1">
                    <Package size={14} />
                    {listing.category}
                  </span>
                )}
                {listing.city && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {listing.city}
                  </span>
                )}
              </div>

              {listing.pairingKeyword && (
                <div className="px-3 py-2 rounded-lg bg-[#4a7c6f]/10 text-sm text-[#4a7c6f]">
                  <strong>Pairs with:</strong> {listing.pairingKeyword}
                </div>
              )}
            </div>

            {/* Seller Info */}
            {listing.user && (
              <Card className="border border-neutral-100 mb-6">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#4a7c6f]/10 flex items-center justify-center text-[#4a7c6f] font-bold text-sm">
                      {listing.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-neutral-900">{listing.user.name}</p>
                      <p className="text-xs text-neutral-400">{listing.user.trustTier} seller</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full h-12 bg-[#4a7c6f] hover:bg-[#3d6b5f] text-white gap-2 rounded-xl"
                onClick={handleMessageSeller}
                disabled={isMessaging}
              >
                {isMessaging ? <Loader2 size={18} className="animate-spin" /> : <MessageSquare size={18} />}
                {isMessaging ? 'Starting chat...' : 'Message seller'}
              </Button>
              <Link href="/marketplace" className="block">
                <Button variant="outline" className="w-full h-12 rounded-xl gap-2">
                  <ArrowLeft size={16} />
                  Back to marketplace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
