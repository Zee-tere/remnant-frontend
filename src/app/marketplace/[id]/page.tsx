"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  HandHeart,
  Heart,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  Recycle,
  RefreshCw,
  Share2,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NameAvatar } from "@/components/ui/name-avatar";
import { NairaIcon } from "@/components/ui/naira-icon";
import { ListingCard, type ListingCardItem } from "@/components/marketplace/ListingCard";
import { listingsApi, conversationsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { conditionLabels } from "@/lib/listing-conditions";
import { getApiErrorMessage } from "@/lib/errors";
import { formatCurrency } from "@/lib/utils";

interface ListingDetail extends ListingCardItem {
  description: string;
  category: string;
  condition: string;
  pairingKeyword: string | null;
  slug: string;
  user?: { id: string; name: string; avatarUrl: string | null; trustTier: string; city?: string | null };
}

const intentionMeta: Record<string, { icon: React.ElementType; label: string; className: string }> = {
  SELL: { icon: NairaIcon, label: "For sale", className: "bg-[var(--brand-soft)] text-[var(--brand)]" },
  TRADE: { icon: RefreshCw, label: "For trade", className: "bg-[#e2f7ff] text-[var(--secondary-blue)]" },
  DONATE: { icon: HandHeart, label: "Free", className: "bg-[#fff6cf] text-[var(--tertiary-gold)]" },
  FIX: { icon: Wrench, label: "Repair", className: "bg-orange-50 text-orange-700" },
  RECYCLE: { icon: Recycle, label: "Recycle", className: "bg-teal-50 text-teal-700" },
};

function formatListedDate(value?: string) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

function GuestMessageDialog({
  listingId,
  listingTitle,
  busy,
  onClose,
  onSubmit,
}: {
  listingId: string;
  listingTitle: string;
  busy: boolean;
  onClose: () => void;
  onSubmit: (details: { name: string; email: string; message: string }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(`Hi, I am interested in ${listingTitle}.`);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/25 sm:items-center sm:p-5" role="presentation">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit({ name, email, message });
        }}
        className="w-full space-y-4 rounded-t-lg bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-lg sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-message-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="guest-message-title" className="text-xl font-bold">Message the seller</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">No account needed.</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--sand)]" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <label className="space-y-2">
          <Label htmlFor="guest-name">Name</Label>
          <Input id="guest-name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={80} required autoComplete="name" />
        </label>
        <label className="space-y-2">
          <Label htmlFor="guest-email">Email</Label>
          <Input id="guest-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required autoComplete="email" />
        </label>
        <label className="space-y-2">
          <Label htmlFor="guest-message">Message</Label>
          <Textarea id="guest-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} required rows={4} />
        </label>
        <Button type="submit" disabled={busy} className="h-12 w-full rounded-full bg-[var(--brand)] font-bold text-white hover:bg-[var(--brand-dark)]">
          {busy ? <Loader2 size={18} className="animate-spin" /> : <MessageSquare size={18} />}
          {busy ? "Sending..." : "Send message"}
        </Button>
        <p className="text-center text-xs text-[var(--muted-foreground)]">
          <Link href={`/login?redirect=${encodeURIComponent(`/marketplace/${listingId}`)}`} className="font-bold text-[var(--brand)]">Log in instead</Link>
        </p>
      </form>
    </div>
  );
}

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isAuthenticated, user } = useAuthStore();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [similarListings, setSimilarListings] = useState<ListingCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activePanel, setActivePanel] = useState<"details" | "seller" | null>(null);
  const [isMessaging, setIsMessaging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showGuestMessage, setShowGuestMessage] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    listingsApi
      .getListing(id)
      .then((data: ListingDetail) => {
        setListing(data);
        listingsApi
          .getSimilarListings(id, 12)
          .then((items: ListingCardItem[]) => setSimilarListings(Array.isArray(items) ? items : []))
          .catch(() => setSimilarListings([]));
      })
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleMessageSeller = async () => {
    if (!listing) return;
    if (!isAuthenticated) {
      setShowGuestMessage(true);
      return;
    }
    if (listing.user?.name === "Guest") {
      toast.info("This seller cannot receive messages yet.");
      return;
    }

    setIsMessaging(true);
    try {
      await conversationsApi.startConversation(listing.id);
      router.push("/user/dashboard?section=messages");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not start conversation"));
    } finally {
      setIsMessaging(false);
    }
  };

  const handleGuestMessage = async (details: { name: string; email: string; message: string }) => {
    if (!listing) return;
    setIsMessaging(true);
    try {
      const result = await conversationsApi.startGuestConversation({ listingId: listing.id, ...details });
      localStorage.setItem(`remnant-guest-conversation:${result.conversation.id}`, result.guestToken);
      setShowGuestMessage(false);
      router.push(`/guest/messages/${result.conversation.id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not send message"));
    } finally {
      setIsMessaging(false);
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
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save listing"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareListing = async () => {
    if (!listing) return;
    try {
      if (navigator.share) await navigator.share({ title: listing.title, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Listing link copied");
      }
    } catch {
      toast.error("Could not share this listing");
    }
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 size={30} className="animate-spin text-[var(--brand)]" /></div>;
  }

  if (!listing) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <Package className="mb-4 text-[var(--muted-foreground)]" size={46} />
        <h1 className="text-xl font-bold">Item not found</h1>
        <Button asChild className="mt-5 rounded-full bg-[var(--brand)] text-white"><Link href="/marketplace">Back to market</Link></Button>
      </div>
    );
  }

  const intent = intentionMeta[listing.intentionTag] ?? intentionMeta.SELL;
  const IntentIcon = intent.icon;
  const selectedSrc = listing.images?.[selectedImage];
  const isGuestSeller = listing.user?.name === "Guest";
  const isOwnListing = listing.user?.id === user?.id;

  return (
    <main className="mx-auto min-h-screen max-w-7xl bg-white px-3 pb-20 pt-3 md:px-8 md:pt-8">
      <Link href="/marketplace" className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted-foreground)] hover:text-[var(--brand)] md:mb-6 md:text-sm">
        <ArrowLeft size={16} /> Back to market
      </Link>

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-8">
        <section className="lg:col-span-7">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--sand)] md:aspect-square">
            {selectedSrc ? (
              <img src={selectedSrc} alt={listing.title} decoding="async" fetchPriority="high" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-[var(--muted-foreground)]"><Package size={64} /></div>
            )}
            <div className="absolute right-2 top-2 flex gap-1.5">
              <button type="button" onClick={handleSaveListing} disabled={isSaving} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--brand)] shadow-sm" aria-label="Save listing">
                {isSaving ? <Loader2 size={17} className="animate-spin" /> : <Heart size={17} />}
              </button>
              <button type="button" onClick={handleShareListing} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--secondary-blue)] shadow-sm" aria-label="Share listing"><Share2 size={17} /></button>
            </div>
          </motion.div>

          {listing.images.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {listing.images.map((image, index) => (
                <button key={`${image}-${index}`} type="button" onClick={() => setSelectedImage(index)} className={`h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 bg-white p-0.5 md:h-16 md:w-16 ${selectedImage === index ? "border-[var(--brand)]" : "border-transparent"}`} aria-label={`View image ${index + 1}`}>
                  <img src={image} alt="" loading="lazy" decoding="async" className="h-full w-full rounded object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="lg:col-span-5">
          <div className="sticky top-24 space-y-4">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.65rem] font-bold md:px-3 md:text-sm ${intent.className}`}>
              <IntentIcon size={12} className="md:h-4 md:w-4" /> {intent.label}
            </span>
            <div>
              <h1 className="text-xl font-bold leading-tight md:text-4xl">{listing.title}</h1>
              <p className="mt-2 text-xl font-bold text-[var(--brand)] md:text-3xl">{listing.price ? formatCurrency(Number(listing.price)) : "Free"}</p>
              <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[var(--muted-foreground)] md:text-sm"><MapPin size={14} /> {listing.city || "Location not set"}</p>
            </div>

            <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Listing information">
              {([
                { key: "details" as const, label: "Product details" },
                { key: "seller" as const, label: "Seller information" },
              ]).map((panel) => (
                <button
                  key={panel.key}
                  type="button"
                  onClick={() => setActivePanel((current) => current === panel.key ? null : panel.key)}
                  className={`flex min-h-11 items-center justify-between rounded-lg border px-3 text-left text-xs font-bold md:text-sm ${activePanel === panel.key ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]" : "border-[var(--border)] bg-white"}`}
                  aria-expanded={activePanel === panel.key}
                >
                  {panel.label}
                  <ChevronDown size={15} className={`shrink-0 transition-transform ${activePanel === panel.key ? "rotate-180" : ""}`} />
                </button>
              ))}
            </div>

            {activePanel === "details" && (
              <div className="rounded-lg border border-[var(--border)] bg-white p-4 text-sm">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div><dt className="text-xs font-semibold text-[var(--muted-foreground)]">Category</dt><dd className="mt-0.5 font-bold">{listing.category}</dd></div>
                  <div><dt className="text-xs font-semibold text-[var(--muted-foreground)]">Condition</dt><dd className="mt-0.5 font-bold">{conditionLabels[listing.condition] || listing.condition}</dd></div>
                  <div className="col-span-2"><dt className="text-xs font-semibold text-[var(--muted-foreground)]">Listed on</dt><dd className="mt-0.5 font-bold">{formatListedDate(listing.createdAt)}</dd></div>
                </dl>
                <div className="mt-4 border-t border-[var(--border)] pt-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--ink-soft)]">{listing.description}</p>
                  {listing.pairingKeyword && <p className="mt-3 text-xs font-semibold text-[var(--brand)]">Pairs with: {listing.pairingKeyword}</p>}
                </div>
              </div>
            )}

            {activePanel === "seller" && (
              <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-white p-4">
                <NameAvatar name={listing.user?.name || "Guest"} className="h-11 w-11 text-base" />
                <div className="min-w-0">
                  <p className="truncate font-bold">{listing.user?.name || "Guest seller"}</p>
                  <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">{listing.user?.city || listing.city || "Location not set"}</p>
                </div>
              </div>
            )}

            <Button
              onClick={handleMessageSeller}
              disabled={isMessaging || isGuestSeller || isOwnListing}
              className="h-12 w-full rounded-full bg-[var(--brand)] text-sm font-bold text-white hover:bg-[var(--brand-dark)]"
            >
              {isMessaging ? <Loader2 size={18} className="animate-spin" /> : <MessageSquare size={18} />}
              {isOwnListing ? "Your listing" : isGuestSeller ? "Seller unavailable" : isMessaging ? "Opening chat..." : "Message seller"}
            </Button>
          </div>
        </section>
      </div>

      {similarListings.length > 0 && (
        <section className="mt-8 border-t border-[var(--border)] pt-5 md:mt-12 md:pt-8">
          <h2 className="mb-3 text-lg font-bold md:text-2xl">Similar items</h2>
          <div className="grid auto-cols-[46%] grid-flow-col gap-2 overflow-x-auto pb-2 scrollbar-hide sm:auto-cols-[31%] lg:auto-cols-[23%] md:gap-4">
            {similarListings.map((item) => <ListingCard key={item.id} item={item} />)}
          </div>
        </section>
      )}

      {showGuestMessage && (
        <GuestMessageDialog listingId={listing.id} listingTitle={listing.title} busy={isMessaging} onClose={() => setShowGuestMessage(false)} onSubmit={handleGuestMessage} />
      )}
    </main>
  );
}
