"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  ExternalLink,
  HandHeart,
  Heart,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Recycle,
  RefreshCw,
  Share2,
  Send,
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
import type { PublicListing } from "@/lib/public-listings";

type ListingDetail = PublicListing;
type SellerContact = { phone?: string; email?: string; telegram?: string };

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

function getListingValue(listing: ListingDetail) {
  if (listing.intentionTag === "SELL") {
    return listing.price ? formatCurrency(Number(listing.price)) : "Price on request";
  }
  if (listing.intentionTag === "TRADE") return "Open to trade";
  if (listing.intentionTag === "DONATE") return "Free";
  if (listing.intentionTag === "FIX") return "Needs repair";
  if (listing.intentionTag === "RECYCLE") return "Ready to recycle";
  return "View item";
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
        className="max-h-[calc(100dvh-0.75rem)] w-full space-y-3 overflow-y-auto rounded-t-lg bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 shadow-2xl sm:max-w-md sm:rounded-lg sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-message-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="guest-message-title" className="text-lg font-bold sm:text-xl">Message the seller</h2>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)] sm:mt-1 sm:text-sm">No account needed.</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--sand)]" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <label className="block space-y-1.5">
          <Label htmlFor="guest-name" className="text-xs font-bold leading-5 sm:text-sm">Name</Label>
          <Input id="guest-name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={80} required autoComplete="name" className="h-11 rounded-lg px-3 text-base sm:h-12 sm:rounded-full sm:px-4" />
        </label>
        <label className="block space-y-1.5">
          <Label htmlFor="guest-email" className="text-xs font-bold leading-5 sm:text-sm">Email</Label>
          <Input id="guest-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required autoComplete="email" className="h-11 rounded-lg px-3 text-base sm:h-12 sm:rounded-full sm:px-4" />
        </label>
        <label className="block space-y-1.5">
          <Label htmlFor="guest-message" className="text-xs font-bold leading-5 sm:text-sm">Message</Label>
          <Textarea id="guest-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} required rows={3} className="min-h-[92px] rounded-lg px-3 py-2.5 text-base sm:min-h-[110px] sm:rounded-[1.5rem] sm:px-4 sm:py-3" />
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

function SellerContactDialog({
  contact,
  listingTitle,
  onClose,
}: {
  contact: SellerContact;
  listingTitle: string;
  onClose: () => void;
}) {
  const options = [
    contact.phone
      ? { label: contact.phone, hint: "Call or send a text", href: `tel:${contact.phone.replace(/[^+\d]/g, "")}`, icon: Phone }
      : null,
    contact.email
      ? { label: contact.email, hint: "Send an email", href: `mailto:${contact.email}?subject=${encodeURIComponent(`Interested in ${listingTitle}`)}`, icon: Mail }
      : null,
    contact.telegram
      ? { label: "Open Telegram", hint: contact.telegram.replace(/^https?:\/\//, ""), href: contact.telegram, icon: Send }
      : null,
  ].filter((option): option is NonNullable<typeof option> => Boolean(option));

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/25 sm:items-center sm:p-5" role="presentation">
      <section className="w-full rounded-t-lg bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-lg sm:p-6" role="dialog" aria-modal="true" aria-labelledby="seller-contact-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="seller-contact-title" className="text-xl font-bold">Contact the seller</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Choose the option that works for you.</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--sand)]" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="mt-5 divide-y divide-[var(--border)] overflow-hidden rounded-lg border border-[var(--border)]">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <a key={option.href} href={option.href} target={option.href.startsWith("https://") ? "_blank" : undefined} rel={option.href.startsWith("https://") ? "noreferrer" : undefined} className="flex min-h-16 items-center gap-3 bg-white px-4 py-3 transition-colors hover:bg-[var(--brand-soft)]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]"><Icon size={18} aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{option.label}</span>
                  <span className="block truncate text-xs text-[var(--muted-foreground)]">{option.hint}</span>
                </span>
                <ExternalLink size={16} className="shrink-0 text-[var(--muted-foreground)]" aria-hidden="true" />
              </a>
            );
          })}
        </div>
        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">Remnant does not verify conversations outside the platform. Avoid sharing passwords or verification codes.</p>
      </section>
    </div>
  );
}

export default function ListingDetailClient({ initialListing }: { initialListing: ListingDetail }) {
  const router = useRouter();
  const id = initialListing.id;
  const { isAuthenticated, user } = useAuthStore();
  const [listing] = useState<ListingDetail>(initialListing);
  const [similarListings, setSimilarListings] = useState<ListingCardItem[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activePanel, setActivePanel] = useState<"details" | "seller" | null>(null);
  const [isMessaging, setIsMessaging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showGuestMessage, setShowGuestMessage] = useState(false);
  const [sellerContact, setSellerContact] = useState<SellerContact | null>(null);

  useEffect(() => {
    listingsApi
      .getSimilarListings(id, 12)
      .then((items: ListingCardItem[]) => setSimilarListings(Array.isArray(items) ? items : []))
      .catch(() => setSimilarListings([]));

    const viewKey = `remnant-listing-view:${id}`;
    if (!sessionStorage.getItem(viewKey)) {
      sessionStorage.setItem(viewKey, "1");
      listingsApi.trackView(id).catch(() => sessionStorage.removeItem(viewKey));
    }
  }, [id]);

  const handleMessageSeller = async () => {
    if (!listing) return;
    const guestSeller = listing.isGuestListing || listing.user?.name === "Guest";
    if (guestSeller) {
      setIsMessaging(true);
      try {
        setSellerContact(await listingsApi.getGuestContact(listing.id));
      } catch (error) {
        toast.error(getApiErrorMessage(error, "This seller has not added a contact method."));
      } finally {
        setIsMessaging(false);
      }
      return;
    }
    if (!isAuthenticated) {
      setShowGuestMessage(true);
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
    const shareUrl = `${window.location.origin}/marketplace/${listing.slug || listing.id}`;
    try {
      if (navigator.share) await navigator.share({ title: listing.title, url: shareUrl });
      else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Listing link copied");
      }
    } catch {
      toast.error("Could not share this listing");
    }
  };

  const intent = intentionMeta[listing.intentionTag] ?? intentionMeta.SELL;
  const IntentIcon = intent.icon;
  const selectedSrc = listing.images?.[selectedImage];
  const isGuestSeller = Boolean(listing.isGuestListing || listing.user?.name === "Guest");
  const isOwnListing = listing.user?.id === user?.id;
  const compatibility = listing.compatibilityAttributes ?? {};
  const needsPair = compatibility.needsPair === true && Boolean(listing.pairingKeyword);

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
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.7rem] font-bold md:px-3 md:text-sm ${intent.className}`}>
              <IntentIcon size={12} className="md:h-4 md:w-4" /> {intent.label}
            </span>
            <div>
              <h1 className="text-xl font-bold leading-tight md:text-4xl">{listing.title}</h1>
              <p className="mt-2 text-xl font-bold text-[var(--brand)] md:text-3xl">{getListingValue(listing)}</p>
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
                  className={`flex min-h-11 items-center justify-between rounded-lg border px-3 text-left text-[0.8rem] font-bold md:text-sm ${activePanel === panel.key ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]" : "border-[var(--border)] bg-white"}`}
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
                  {needsPair && <div className="col-span-2"><dt className="text-xs font-semibold text-[var(--muted-foreground)]">Missing piece</dt><dd className="mt-0.5 font-bold text-[var(--brand)]">Looking for {listing.pairingKeyword}</dd></div>}
                </dl>
                <div className="mt-4 border-t border-[var(--border)] pt-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--ink-soft)]">{listing.description}</p>
                  {!needsPair && listing.pairingKeyword && <p className="mt-3 text-xs font-semibold text-[var(--brand)]">Pairs with: {listing.pairingKeyword}</p>}
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
              disabled={isMessaging || isOwnListing}
              className="h-12 w-full rounded-full bg-[var(--brand)] text-sm font-bold text-white hover:bg-[var(--brand-dark)]"
            >
              {isMessaging ? <Loader2 size={18} className="animate-spin" /> : <MessageSquare size={18} />}
              {isOwnListing ? "Your listing" : isMessaging ? "Connecting..." : isGuestSeller ? "Contact seller" : "Message seller"}
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
      {sellerContact && (
        <SellerContactDialog contact={sellerContact} listingTitle={listing.title} onClose={() => setSellerContact(null)} />
      )}
    </main>
  );
}
