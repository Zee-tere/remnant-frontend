"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  HandHeart,
  Heart,
  Info,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  Recycle,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { listingsApi, conversationsApi, transactionsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { NairaIcon } from "@/components/ui/naira-icon";
import { getApiErrorMessage } from "@/lib/errors";

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

const intentionMeta: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  SELL: { icon: NairaIcon, label: "For Sale", color: "text-[var(--brand)]", bg: "bg-[var(--brand-soft)]" },
  TRADE: { icon: RefreshCw, label: "For Trade", color: "text-[var(--secondary-blue)]", bg: "bg-[#e2f7ff]" },
  DONATE: { icon: HandHeart, label: "Free / Donate", color: "text-[var(--tertiary-gold)]", bg: "bg-[#fff6cf]" },
  FIX: { icon: Wrench, label: "Needs Repair", color: "text-orange-700", bg: "bg-orange-50" },
  RECYCLE: { icon: Recycle, label: "Recycle", color: "text-teal-700", bg: "bg-teal-50" },
};

const conditionLabels: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor / Broken",
};

const escrowEnabled = process.env.NEXT_PUBLIC_ESCROW_ENABLED === "true";

function formatListedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently listed";
  return date.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isAuthenticated, user } = useAuthStore();

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isMessaging, setIsMessaging] = useState(false);
  const [isStartingEscrow, setIsStartingEscrow] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    listingsApi
      .getListing(id)
      .then((data: ListingDetail) => setListing(data))
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleMessageSeller = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/marketplace/${id}`)}`);
      return;
    }
    if (!listing) return;
    if (listing.user?.name === "Guest") {
      toast.info("This seller has not created a profile yet, so messaging is not available.");
      return;
    }
    setIsMessaging(true);
    try {
      await conversationsApi.startConversation(listing.id);
      toast.success("Conversation started");
      router.push("/user/dashboard?section=messages");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Could not start conversation"));
    } finally {
      setIsMessaging(false);
    }
  };

  const handleStartEscrow = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/marketplace/${id}`)}`);
      return;
    }
    if (!listing) return;

    setIsStartingEscrow(true);
    try {
      const transaction = await transactionsApi.initiateTransaction(listing.id);
      toast.success("Escrow transaction started");
      if (transaction.escrowCheckoutUrl) {
        if (/^https?:\/\//i.test(transaction.escrowCheckoutUrl)) {
          window.location.href = transaction.escrowCheckoutUrl;
        } else {
          router.push(transaction.escrowCheckoutUrl);
        }
        return;
      }
      router.push(`/transactions/${transaction.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not start escrow";
      toast.error(msg);
    } finally {
      setIsStartingEscrow(false);
    }
  };

  const handleSaveListing = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/marketplace/${id}`)}`);
      return;
    }
    if (!listing) return;

    setIsSaving(true);
    try {
      await listingsApi.saveListing(listing.id);
      toast.success("Listing saved");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not save listing";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareListing = async () => {
    if (!listing || typeof window === "undefined") return;
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, text: listing.description, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Listing link copied");
      }
    } catch {
      toast.error("Could not share this listing");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={30} className="animate-spin text-[var(--brand)]" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <Package className="mb-4 text-[var(--muted-foreground)]" size={50} />
        <h2 className="mb-2 text-2xl font-bold text-[var(--foreground)]">Item not found</h2>
        <p className="mb-7 max-w-md font-medium text-[var(--ink-soft)]">
          This listing may have been removed or is no longer available.
        </p>
        <Button asChild className="rounded-full bg-[var(--brand)] px-7 font-bold text-white hover:bg-[var(--brand-dark)]">
          <Link href="/marketplace">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to marketplace
          </Link>
        </Button>
      </div>
    );
  }

  const intent = intentionMeta[listing.intentionTag] || intentionMeta.SELL;
  const IntentIcon = intent.icon;
  const canUseEscrow = escrowEnabled && listing.intentionTag === "SELL" && Boolean(listing.price) && listing.user?.id !== user?.id;
  const selectedSrc = listing.images?.[selectedImage];
  const isGuestSeller = listing.user?.name === "Guest";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-10 md:px-8">
        <Link
          href="/marketplace"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[var(--muted-foreground)] transition-colors hover:text-[var(--brand)]"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Back to marketplace
        </Link>

        <div className="grid gap-10 lg:grid-cols-12">
          <section className="lg:col-span-7">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group relative">
              <div className="surface-card relative aspect-square overflow-hidden rounded-[3rem] p-5 md:p-8">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[2rem] bg-[var(--sand)]">
                  {selectedSrc ? (
                    <img
                      src={selectedSrc}
                      alt={listing.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[var(--muted-foreground)]">
                      <Package size={72} aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="absolute right-7 top-7 flex gap-2 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={handleSaveListing}
                    disabled={isSaving}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--brand)] soft-shadow"
                    aria-label="Save listing"
                  >
                    {isSaving ? <Loader2 size={20} className="animate-spin" aria-hidden="true" /> : <Heart size={20} aria-hidden="true" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleShareListing}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--secondary-blue)] soft-shadow"
                    aria-label="Share listing"
                  >
                    <Share2 size={20} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </motion.div>

            {listing.images && listing.images.length > 1 && (
              <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
                {listing.images.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-[1.25rem] border-2 bg-white p-1 transition-colors ${
                      selectedImage === index ? "border-[var(--brand)]" : "border-transparent hover:border-[var(--border)]"
                    }`}
                    aria-label={`View listing image ${index + 1}`}
                  >
                    <img src={img} alt="" className="h-full w-full rounded-[1rem] object-cover" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="lg:col-span-5">
            <div className="sticky top-28 space-y-8">
              <div>
                <div className="mb-5 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${intent.bg} ${intent.color}`}>
                    <IntentIcon size={16} aria-hidden="true" />
                    {intent.label}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-bold text-[var(--ink-soft)] shadow-sm">
                    <ShieldCheck size={16} aria-hidden="true" />
                    {conditionLabels[listing.condition] || listing.condition}
                  </span>
                </div>

                <h1 className="text-2xl font-bold leading-tight text-[var(--foreground)] md:text-5xl">
                  {listing.title}
                </h1>
                <p className="mt-4 text-3xl font-bold text-[var(--brand)]">
                  {listing.price ? formatCurrency(Number(listing.price)) : "Free"}
                </p>
              </div>

              <p className="text-lg font-medium leading-8 text-[var(--ink-soft)]">{listing.description}</p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] bg-white p-4 soft-shadow">
                  <p className="text-xs font-bold uppercase text-[var(--muted-foreground)]">Category</p>
                  <p className="mt-1 font-bold text-[var(--foreground)]">{listing.category}</p>
                </div>
                <div className="rounded-[1.5rem] bg-white p-4 soft-shadow">
                  <p className="text-xs font-bold uppercase text-[var(--muted-foreground)]">Location</p>
                  <p className="mt-1 flex items-center gap-1 font-bold text-[var(--foreground)]">
                    <MapPin size={15} aria-hidden="true" />
                    {listing.city || "Location not set"}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-white p-4 soft-shadow sm:col-span-2">
                  <p className="text-xs font-bold uppercase text-[var(--muted-foreground)]">Listed</p>
                  <p className="mt-1 flex items-center gap-1 font-bold text-[var(--foreground)]">
                    <Calendar size={15} aria-hidden="true" />
                    {formatListedDate(listing.createdAt)}
                  </p>
                </div>
              </div>

              {listing.user && (
                <div className="surface-card flex items-center justify-between gap-4 rounded-[2rem] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[var(--brand-soft)] text-lg font-bold text-[var(--brand)]">
                      {listing.user.avatarUrl ? (
                        <img src={listing.user.avatarUrl} alt={listing.user.name} className="h-full w-full object-cover" />
                      ) : (
                        listing.user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--foreground)]">{listing.user.name}</p>
                      <p className="text-sm font-semibold text-[var(--muted-foreground)]">
                        {isGuestSeller ? "Guest listing" : `${listing.user.trustTier} curator`}
                      </p>
                    </div>
                  </div>
                  <ShieldCheck className="text-[var(--brand)]" size={24} aria-hidden="true" />
                </div>
              )}

              <div className="space-y-3">
                {canUseEscrow && (
                  <Button
                    className="h-14 w-full rounded-full bg-[var(--brand)] text-base font-bold text-white hover:bg-[var(--brand-dark)]"
                    onClick={handleStartEscrow}
                    disabled={isStartingEscrow}
                  >
                    {isStartingEscrow ? <Loader2 size={19} className="animate-spin" /> : <ShieldCheck size={19} />}
                    {isStartingEscrow ? "Starting escrow..." : "Buy with escrow"}
                  </Button>
                )}
                <Button
                  className="h-14 w-full rounded-full bg-white text-base font-bold text-[var(--brand)] shadow-sm hover:bg-[var(--brand-soft)]"
                  onClick={handleMessageSeller}
                  disabled={isMessaging || isGuestSeller}
                >
                  {isMessaging ? <Loader2 size={19} className="animate-spin" /> : <MessageSquare size={19} />}
                  {isGuestSeller ? "Seller has not joined yet" : isMessaging ? "Starting chat..." : "Message seller"}
                </Button>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="surface-card rounded-[2rem] p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e2f7ff] text-[var(--secondary-blue)]">
                <Sparkles size={22} aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold">Why it may be a match</h2>
            </div>
            <ul className="space-y-4 font-medium leading-7 text-[var(--ink-soft)]">
              <li className="flex gap-3">
                <ShieldCheck className="mt-1 shrink-0 text-[var(--secondary-blue)]" size={19} aria-hidden="true" />
                <span>
                  Intent is marked as <strong>{intent.label}</strong>, so buyers know the right exchange path.
                </span>
              </li>
              <li className="flex gap-3">
                <ShieldCheck className="mt-1 shrink-0 text-[var(--secondary-blue)]" size={19} aria-hidden="true" />
                <span>
                  {listing.pairingKeyword
                    ? `Pairing clue: ${listing.pairingKeyword}.`
                    : `Category clue: ${listing.category}.`}
                </span>
              </li>
            </ul>
          </div>

          <div className="surface-card rounded-[2rem] p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
                <Info size={22} aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold">Condition Notes</h2>
            </div>
            <p className="font-medium leading-8 text-[var(--ink-soft)]">
              Listed as <strong>{conditionLabels[listing.condition] || listing.condition}</strong>. Ask the curator
              for exact measurements, extra photos, or confirmation before closing the exchange.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-sm font-bold text-[var(--ink-soft)]">
                {listing.category}
              </span>
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-sm font-bold text-[var(--ink-soft)]">
                {intent.label}
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
