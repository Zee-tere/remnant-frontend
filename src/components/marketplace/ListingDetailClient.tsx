"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  Heart,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Send,
  Share2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NameAvatar } from "@/components/ui/name-avatar";
import { IntentBadge, listingIntentMeta, normalizeListingIntent } from "@/components/ui/intent-badge";
import { ListingCard, type ListingCardItem } from "@/components/marketplace/ListingCard";
import { listingsApi, conversationsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { conditionLabels } from "@/lib/listing-conditions";
import { getApiErrorMessage } from "@/lib/errors";
import { formatCurrency } from "@/lib/utils";
import {
  directContactLabels,
  directContactMethods,
  directContactPlaceholders,
  getDirectContactHref,
  isPlausibleDirectContact,
  type DirectContactMethod,
} from "@/lib/direct-contact";
import type { PublicListing } from "@/lib/public-listings";

type ListingDetail = PublicListing;

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
  return listingIntentMeta[normalizeListingIntent(listing.intentionTag)].valueLabel;
}

interface GuestInquiryDetails {
  name: string;
  offer: string;
  contactMethod: DirectContactMethod;
  contactValue: string;
}

function GuestInquiryForm({
  listingTitle,
  busy,
  onClose,
  onSubmit,
}: {
  listingTitle: string;
  busy: boolean;
  onClose: () => void;
  onSubmit: (details: GuestInquiryDetails) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [offer, setOffer] = useState(`Hi, is ${listingTitle} still available? I’d like to arrange the next step.`);
  const [contactMethod, setContactMethod] = useState<DirectContactMethod>("WHATSAPP");
  const [contactValue, setContactValue] = useState("");
  const [validationError, setValidationError] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!isPlausibleDirectContact(contactMethod, contactValue)) {
          setValidationError(`Enter a valid ${directContactLabels[contactMethod]} contact.`);
          return;
        }
        setValidationError("");
        void onSubmit({ name, offer, contactMethod, contactValue });
      }}
      className="space-y-5 rounded-2xl border border-black/10 bg-[#f7f7f7] p-4 sm:p-5"
      aria-labelledby="guest-inquiry-title"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">No account needed</p>
          <h2 id="guest-inquiry-title" className="mt-1 text-xl font-bold tracking-[-0.025em] text-[#111]">Message the seller</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">The seller receives your note and contact, then replies to you outside Remnant.</p>
        </div>
        <button type="button" data-keep-round onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#111] hover:bg-black/5" aria-label="Close form">
          <X size={18} />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <Label htmlFor="guest-name" className="text-sm font-bold">Your name</Label>
          <Input id="guest-name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={80} required autoComplete="name" className="h-12 rounded-xl border-black/15 bg-white px-4 text-base" />
        </label>
        <div className="space-y-1.5">
          <span className="text-sm font-bold">Reply to me on</span>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Reply method">
            {directContactMethods.map((method) => {
              const Icon = method === "EMAIL" ? Mail : method === "TELEGRAM" ? Send : MessageSquare;
              const selected = contactMethod === method;
              return (
                <button
                  key={method}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => { setContactMethod(method); setValidationError(""); }}
                  className={`flex h-12 items-center justify-center rounded-xl border ${selected ? "border-[#111] bg-[#111] text-white" : "border-black/15 bg-white text-[#333]"}`}
                  aria-label={directContactLabels[method]}
                >
                  <Icon size={16} />
                </button>
              );
            })}
          </div>
        </div>
        <label className="block space-y-1.5 sm:col-span-2">
          <Label htmlFor="guest-contact" className="text-sm font-bold">Your {directContactLabels[contactMethod]}</Label>
          <Input
            id="guest-contact"
            value={contactValue}
            onChange={(event) => { setContactValue(event.target.value); setValidationError(""); }}
            placeholder={directContactPlaceholders[contactMethod]}
            inputMode={contactMethod === "WHATSAPP" ? "tel" : contactMethod === "EMAIL" ? "email" : "text"}
            required
            className="h-12 rounded-xl border-black/15 bg-white px-4 text-base"
          />
        </label>
        <label className="block space-y-1.5 sm:col-span-2">
          <Label htmlFor="guest-offer" className="text-sm font-bold">Message</Label>
          <Textarea id="guest-offer" value={offer} onChange={(event) => setOffer(event.target.value)} maxLength={2000} required rows={4} className="min-h-[120px] rounded-xl border-black/15 bg-white px-4 py-3 text-base" />
          <p className="text-xs leading-5 text-[var(--muted-foreground)]">Include your offer and any useful delivery or pickup details.</p>
        </label>
      </div>
      {validationError && <p role="alert" className="text-sm font-semibold text-red-700">{validationError}</p>}
      <Button type="submit" disabled={busy} className="h-14 w-full rounded-xl bg-[#111] text-base font-bold text-white hover:bg-black">
        {busy ? <Loader2 size={18} className="animate-spin" /> : <MessageSquare size={18} />}
        {busy ? "Sending…" : "Send message and contact"}
      </Button>
    </form>
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
  const guestMessageRequestRef = useRef<string | null>(null);
  const contactPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listingsApi.getSimilarListings(id, 12).then((items: ListingCardItem[]) => setSimilarListings(Array.isArray(items) ? items : [])).catch(() => setSimilarListings([]));
    const viewKey = `remnant-listing-view:${id}`;
    if (!sessionStorage.getItem(viewKey)) {
      sessionStorage.setItem(viewKey, "1");
      listingsApi.trackView(id).catch(() => sessionStorage.removeItem(viewKey));
    }
  }, [id]);

  const isGuestSeller = Boolean(listing.isGuestListing || listing.user?.name === "Guest");
  const isOwnListing = listing.user?.id === user?.id;
  const sellerContact = isGuestSeller ? listing.guestContact : undefined;

  const handleMessageSeller = async () => {
    if (!isAuthenticated) {
      setShowGuestMessage(true);
      window.requestAnimationFrame(() => contactPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
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

  const handleGuestMessage = async (details: GuestInquiryDetails) => {
    setIsMessaging(true);
    try {
      guestMessageRequestRef.current ??= crypto.randomUUID();
      await conversationsApi.startGuestConversation({ listingId: listing.id, ...details, clientRequestId: guestMessageRequestRef.current });
      setShowGuestMessage(false);
      guestMessageRequestRef.current = null;
      toast.success("Message sent", { description: `The seller can reply through ${directContactLabels[details.contactMethod]}.` });
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
    const shareUrl = `${window.location.origin}/marketplace/${listing.slug || listing.id}`;
    try {
      if (navigator.share) await navigator.share({ title: listing.title, url: shareUrl });
      else { await navigator.clipboard.writeText(shareUrl); toast.success("Listing link copied"); }
    } catch { toast.error("Could not share this listing"); }
  };

  const selectedSrc = listing.images?.[selectedImage];
  const compatibility = listing.compatibilityAttributes ?? {};
  const needsPair = compatibility.needsPair === true && Boolean(listing.pairingKeyword);
  const contactGreeting = `Hi, I’m contacting you about ${listing.title} on Remnant.`;

  return (
    <main className="mx-auto min-h-screen max-w-7xl bg-white px-3 pb-20 pt-3 md:px-8 md:pt-8">
      <Link href="/marketplace" className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted-foreground)] hover:text-[var(--brand)] md:mb-6 md:text-sm"><ArrowLeft size={16} /> Back to marketplace</Link>
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-8">
        <section className="lg:col-span-7">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group relative aspect-[4/3] overflow-hidden rounded-card border border-[var(--border)] bg-[var(--sand)] md:aspect-square">
            {selectedSrc ? <img src={selectedSrc} alt={listing.title} decoding="async" fetchPriority="high" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[var(--muted-foreground)]"><Package size={64} /></div>}
            <div className="absolute right-2 top-2 flex gap-1.5">
              <button type="button" data-keep-round onClick={handleSaveListing} disabled={isSaving} className="flex h-11 w-11 items-center justify-center rounded-pill border border-[var(--border)]/55 bg-white text-[var(--brand)]" aria-label="Save listing">{isSaving ? <Loader2 size={17} className="animate-spin" /> : <Heart size={17} />}</button>
              <button type="button" data-keep-round onClick={handleShareListing} className="flex h-11 w-11 items-center justify-center rounded-pill border border-[var(--border)]/55 bg-white text-[var(--secondary-blue)]" aria-label="Share listing"><Share2 size={17} /></button>
            </div>
          </motion.div>
          {listing.images.length > 1 && <div className="mt-2 flex gap-2 overflow-x-auto pb-1">{listing.images.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setSelectedImage(index)} className={`h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 bg-white p-0.5 md:h-16 md:w-16 ${selectedImage === index ? "border-[var(--brand)]" : "border-transparent"}`} aria-label={`View image ${index + 1}`}><img src={image} alt="" loading="lazy" decoding="async" className="h-full w-full rounded object-cover" /></button>)}</div>}
        </section>

        <section className="lg:col-span-5">
          <div className="sticky top-24 space-y-4">
            <IntentBadge intent={listing.intentionTag} />
            <div>
              <h1 className="text-xl font-bold leading-tight md:text-4xl">{listing.title}</h1>
              <p className="mt-2 text-xl font-bold text-[var(--brand)] md:text-3xl">{getListingValue(listing)}</p>
              <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[var(--muted-foreground)] md:text-sm"><MapPin size={14} /> {listing.city || "Location not set"}</p>
            </div>

            {isGuestSeller ? (
              sellerContact ? (
                <div className="rounded-2xl border border-black/10 bg-[#f7f7f7] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Guest seller</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">This seller uses {directContactLabels[sellerContact.method]} instead of Remnant messages.</p>
                  <Button asChild className="mt-3 h-14 w-full rounded-xl bg-[#111] text-base font-bold text-white hover:bg-black">
                    <a href={getDirectContactHref(sellerContact, contactGreeting)} target={sellerContact.method === "EMAIL" ? undefined : "_blank"} rel="noreferrer"><MessageSquare size={18} /> Contact on {directContactLabels[sellerContact.method]}</a>
                  </Button>
                  <p className="mt-2 break-all text-center text-xs font-semibold text-[var(--muted-foreground)]">{sellerContact.value}</p>
                </div>
              ) : <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">This older guest listing does not have public contact details.</div>
            ) : (
              <Button onClick={handleMessageSeller} disabled={isMessaging || isOwnListing} className="h-14 w-full rounded-xl bg-[#111] text-base font-bold text-white hover:bg-black">
                {isMessaging ? <Loader2 size={18} className="animate-spin" /> : <MessageSquare size={18} />}
                {isOwnListing ? "Your listing" : isMessaging ? "Connecting…" : "Message seller"}
              </Button>
            )}

            {showGuestMessage && !isGuestSeller && <div ref={contactPanelRef}><GuestInquiryForm listingTitle={listing.title} busy={isMessaging} onClose={() => setShowGuestMessage(false)} onSubmit={handleGuestMessage} /></div>}

            <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Listing information">
              {([{ key: "details" as const, label: "Product details" }, { key: "seller" as const, label: "Seller information" }]).map((panel) => <button key={panel.key} type="button" onClick={() => setActivePanel((current) => current === panel.key ? null : panel.key)} className={`flex min-h-11 items-center justify-between rounded-control border px-3 text-left text-sm font-bold ${activePanel === panel.key ? "border-[#111] bg-[#f7f7f7] text-[#111]" : "border-[var(--border)] bg-white"}`} aria-expanded={activePanel === panel.key}>{panel.label}<ChevronDown size={15} className={`shrink-0 transition-transform ${activePanel === panel.key ? "rotate-180" : ""}`} /></button>)}
            </div>
            {activePanel === "details" && <div className="rounded-card border border-[var(--border)] bg-white p-4 text-sm"><dl className="grid grid-cols-2 gap-x-4 gap-y-3"><div><dt className="text-xs font-semibold text-[var(--muted-foreground)]">Category</dt><dd className="mt-0.5 font-bold">{listing.category}</dd></div><div><dt className="text-xs font-semibold text-[var(--muted-foreground)]">Condition</dt><dd className="mt-0.5 font-bold">{conditionLabels[listing.condition] || listing.condition}</dd></div><div className="col-span-2"><dt className="text-xs font-semibold text-[var(--muted-foreground)]">Listed on</dt><dd className="mt-0.5 font-bold">{formatListedDate(listing.createdAt)}</dd></div>{needsPair && <div className="col-span-2"><dt className="text-xs font-semibold text-[var(--muted-foreground)]">Missing piece</dt><dd className="mt-0.5 font-bold text-[var(--brand)]">Looking for {listing.pairingKeyword}</dd></div>}</dl><div className="mt-4 border-t border-[var(--border)] pt-4"><p className="whitespace-pre-wrap text-sm leading-6 text-[var(--ink-soft)]">{listing.description}</p>{!needsPair && listing.pairingKeyword && <p className="mt-3 text-xs font-semibold text-[var(--brand)]">Pairs with: {listing.pairingKeyword}</p>}</div></div>}
            {activePanel === "seller" && <div className="flex items-center gap-3 rounded-card border border-[var(--border)] bg-white p-4"><NameAvatar name={listing.user?.name || "Guest"} className="h-11 w-11 text-base" /><div className="min-w-0"><p className="truncate font-bold">{listing.user?.name || "Guest seller"}</p><p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">{listing.user?.city || listing.city || "Location not set"}</p></div></div>}
          </div>
        </section>
      </div>

      {similarListings.length > 0 && <section className="mt-8 border-t border-[var(--border)] pt-5 md:mt-12 md:pt-8"><h2 className="mb-3 text-lg font-bold md:text-2xl">Similar items</h2><div className="grid grid-cols-3 gap-1.5 sm:gap-3 md:grid-cols-4 md:gap-4">{similarListings.map((item) => <ListingCard key={item.id} item={item} />)}</div></section>}
    </main>
  );
}
