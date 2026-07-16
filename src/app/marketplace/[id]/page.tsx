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
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listingsApi, conversationsApi, transactionsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { NairaIcon } from "@/components/ui/naira-icon";
import { getApiErrorMessage } from "@/lib/errors";
import { conditionLabels } from "@/lib/listing-conditions";
import { NameAvatar } from "@/components/ui/name-avatar";

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

type GuestAction = "buy" | "message";

function GuestActionDialog({
  action,
  listingId,
  listingTitle,
  busy,
  onClose,
  onSubmit,
}: {
  action: GuestAction;
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
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/20 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" role="presentation">
      <div className="w-full rounded-t-lg bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-lg sm:p-6" role="dialog" aria-modal="true" aria-labelledby="guest-action-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="guest-action-title" className="text-xl font-bold text-[var(--foreground)]">
              {action === "buy" ? "Continue to payment" : "Message the seller"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
              No account needed. We will use your email for this {action === "buy" ? "order" : "conversation"} only.
            </p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-[var(--sand)]" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit({ name, email, message });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="guest-name">Name</Label>
            <Input id="guest-name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={80} required autoComplete="name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guest-email">Email</Label>
            <Input id="guest-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required autoComplete="email" />
          </div>
          {action === "message" && (
            <div className="space-y-2">
              <Label htmlFor="guest-message">Message</Label>
              <Textarea id="guest-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} required rows={4} />
            </div>
          )}
          <Button type="submit" disabled={busy} className="h-12 w-full rounded-full bg-[var(--brand)] font-bold text-white hover:bg-[var(--brand-dark)]">
            {busy && <Loader2 size={18} className="animate-spin" />}
            {busy ? "Please wait..." : action === "buy" ? "Continue securely" : "Send message"}
          </Button>
          <p className="text-center text-xs leading-5 text-[var(--muted-foreground)]">
            Prefer an account? <Link href={`/login?redirect=${encodeURIComponent(`/marketplace/${listingId}`)}`} className="font-bold text-[var(--brand)]">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

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
  const [isStartingPayment, setIsStartingPayment] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [guestAction, setGuestAction] = useState<GuestAction | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<{ paymentsEnabled: boolean; guestCheckoutEnabled: boolean } | null>(null);

  useEffect(() => {
    if (!id) return;
    listingsApi
      .getListing(id)
      .then((data: ListingDetail) => setListing(data))
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    transactionsApi.getConfig().then(setPaymentConfig).catch(() => setPaymentConfig(null));
  }, []);

  const handleMessageSeller = async () => {
    if (!isAuthenticated) {
      setGuestAction("message");
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

  const sendToCheckout = (transaction: { id: string; paymentCheckoutUrl?: string | null; escrowCheckoutUrl?: string | null }) => {
    const checkoutUrl = transaction.paymentCheckoutUrl || transaction.escrowCheckoutUrl;
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
      return;
    }
    router.push(`/transactions/${transaction.id}`);
  };

  const handleStartPayment = async () => {
    if (!isAuthenticated) {
      if (!paymentConfig?.guestCheckoutEnabled) {
        toast.info("Guest checkout is not available yet. Please log in to continue.");
        router.push(`/login?redirect=${encodeURIComponent(`/marketplace/${id}`)}`);
        return;
      }
      setGuestAction("buy");
      return;
    }
    if (!listing) return;

    setIsStartingPayment(true);
    try {
      const transaction = await transactionsApi.initiateTransaction(listing.id);
      toast.success("Secure checkout is ready");
      sendToCheckout(transaction);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Could not start payment"));
    } finally {
      setIsStartingPayment(false);
    }
  };

  const handleGuestAction = async (details: { name: string; email: string; message: string }) => {
    if (!listing || !guestAction) return;
    const action = guestAction;
    if (action === "buy") setIsStartingPayment(true);
    else setIsMessaging(true);
    try {
      if (action === "buy") {
        const transaction = await transactionsApi.initiateGuestTransaction({
          listingId: listing.id,
          name: details.name,
          email: details.email,
        });
        localStorage.setItem(`remnant-guest-order:${transaction.id}`, transaction.guestToken);
        const reference = transaction.paymentReference || transaction.escrowTransactionId;
        if (reference) {
          localStorage.setItem(`remnant-guest-payment:${reference}`, JSON.stringify({ transactionId: transaction.id, token: transaction.guestToken }));
        }
        setGuestAction(null);
        sendToCheckout(transaction);
      } else {
        const result = await conversationsApi.startGuestConversation({
          listingId: listing.id,
          name: details.name,
          email: details.email,
          message: details.message,
        });
        localStorage.setItem(`remnant-guest-conversation:${result.conversation.id}`, result.guestToken);
        setGuestAction(null);
        toast.success("Message sent");
        router.push(`/guest/messages/${result.conversation.id}`);
      }
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, `Could not ${action === "buy" ? "start payment" : "send message"}`));
    } finally {
      setIsStartingPayment(false);
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
  const canBuy = paymentConfig?.paymentsEnabled && listing.intentionTag === "SELL" && Boolean(listing.price) && listing.user?.id !== user?.id;
  const selectedSrc = listing.images?.[selectedImage];
  const isGuestSeller = listing.user?.name === "Guest";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <main className="mx-auto max-w-7xl px-3 pb-20 pt-3 md:px-8 md:pt-10">
        <Link
          href="/marketplace"
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted-foreground)] transition-colors hover:text-[var(--brand)] md:mb-8 md:gap-2 md:text-sm"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Back to marketplace
        </Link>

        <div className="grid gap-4 md:gap-10 lg:grid-cols-12">
          <section className="lg:col-span-7">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group relative">
              <div className="surface-card relative aspect-[4/3] overflow-hidden rounded-lg p-0 md:aspect-square md:rounded-[3rem] md:p-8">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-[var(--sand)] md:rounded-[2rem]">
                  {selectedSrc ? (
                    <img
                      src={selectedSrc}
                      alt={listing.title}
                      decoding="async"
                      fetchPriority="high"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[var(--muted-foreground)]">
                      <Package size={72} aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="absolute right-2 top-2 flex gap-1.5 opacity-100 md:right-7 md:top-7 md:gap-2 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={handleSaveListing}
                    disabled={isSaving}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--brand)] soft-shadow md:h-12 md:w-12"
                    aria-label="Save listing"
                  >
                    {isSaving ? <Loader2 size={17} className="animate-spin md:h-5 md:w-5" aria-hidden="true" /> : <Heart size={17} className="md:h-5 md:w-5" aria-hidden="true" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleShareListing}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--secondary-blue)] soft-shadow md:h-12 md:w-12"
                    aria-label="Share listing"
                  >
                    <Share2 size={17} className="md:h-5 md:w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </motion.div>

            {listing.images && listing.images.length > 1 && (
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1 md:mt-5 md:gap-3 md:pb-2">
                {listing.images.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 bg-white p-0.5 transition-colors md:h-20 md:w-20 md:rounded-[1.25rem] md:p-1 ${
                      selectedImage === index ? "border-[var(--brand)]" : "border-transparent hover:border-[var(--border)]"
                    }`}
                    aria-label={`View listing image ${index + 1}`}
                  >
                    <img src={img} alt="" loading="lazy" decoding="async" className="h-full w-full rounded-md object-cover md:rounded-[1rem]" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="lg:col-span-5">
            <div className="sticky top-28 space-y-4 md:space-y-8">
              <div>
                <div className="mb-2 flex flex-wrap gap-1.5 md:mb-5 md:gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.65rem] font-bold md:gap-1.5 md:px-3 md:text-sm ${intent.bg} ${intent.color}`}>
                    <IntentIcon size={12} className="md:h-4 md:w-4" aria-hidden="true" />
                    {intent.label}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[0.65rem] font-bold text-[var(--ink-soft)] shadow-sm md:gap-1.5 md:px-3 md:text-sm">
                    <ShieldCheck size={12} className="md:h-4 md:w-4" aria-hidden="true" />
                    {conditionLabels[listing.condition] || listing.condition}
                  </span>
                </div>

                <h1 className="text-xl font-bold leading-tight text-[var(--foreground)] md:text-5xl">
                  {listing.title}
                </h1>
                <p className="mt-2 text-xl font-bold text-[var(--brand)] md:mt-4 md:text-3xl">
                  {listing.price ? formatCurrency(Number(listing.price)) : "Free"}
                </p>
              </div>

              <p className="text-sm font-medium leading-6 text-[var(--ink-soft)] md:text-lg md:leading-8">{listing.description}</p>

              <div className="grid grid-cols-3 gap-2 md:grid-cols-2 md:gap-3">
                <div className="min-w-0 rounded-lg bg-white p-2.5 soft-shadow md:rounded-[1.5rem] md:p-4">
                  <p className="text-[0.55rem] font-bold uppercase text-[var(--muted-foreground)] md:text-xs">Category</p>
                  <p className="mt-1 truncate text-[0.68rem] font-bold text-[var(--foreground)] md:text-base">{listing.category}</p>
                </div>
                <div className="min-w-0 rounded-lg bg-white p-2.5 soft-shadow md:rounded-[1.5rem] md:p-4">
                  <p className="text-[0.55rem] font-bold uppercase text-[var(--muted-foreground)] md:text-xs">Location</p>
                  <p className="mt-1 flex min-w-0 items-center gap-0.5 text-[0.68rem] font-bold text-[var(--foreground)] md:gap-1 md:text-base">
                    <MapPin size={11} className="shrink-0 md:h-[15px] md:w-[15px]" aria-hidden="true" />
                    <span className="truncate">{listing.city || "Not set"}</span>
                  </p>
                </div>
                <div className="min-w-0 rounded-lg bg-white p-2.5 soft-shadow md:col-span-2 md:rounded-[1.5rem] md:p-4">
                  <p className="text-[0.55rem] font-bold uppercase text-[var(--muted-foreground)] md:text-xs">Listed</p>
                  <p className="mt-1 flex min-w-0 items-center gap-0.5 text-[0.68rem] font-bold text-[var(--foreground)] md:gap-1 md:text-base">
                    <Calendar size={11} className="shrink-0 md:h-[15px] md:w-[15px]" aria-hidden="true" />
                    <span className="truncate">
                    {formatListedDate(listing.createdAt)}
                    </span>
                  </p>
                </div>
              </div>

              {listing.user && (
                <div className="surface-card flex items-center justify-between gap-3 rounded-lg p-3 md:gap-4 md:rounded-[2rem] md:p-5">
                  <div className="flex items-center gap-3">
                    <NameAvatar name={listing.user.name} className="h-9 w-9 text-sm md:h-12 md:w-12 md:text-lg" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[var(--foreground)] md:text-base">{listing.user.name}</p>
                      <p className="truncate text-xs font-semibold text-[var(--muted-foreground)] md:text-sm">
                        {isGuestSeller ? "Guest listing" : `${listing.user.trustTier} curator`}
                      </p>
                    </div>
                  </div>
                  <ShieldCheck className="shrink-0 text-[var(--brand)] md:h-6 md:w-6" size={18} aria-hidden="true" />
                </div>
              )}

              <div className="space-y-3">
                {canBuy && !isGuestSeller && (
                  <Button
                    className="h-11 w-full rounded-full bg-[var(--brand)] text-sm font-bold text-white hover:bg-[var(--brand-dark)] md:h-14 md:text-base"
                    onClick={handleStartPayment}
                    disabled={isStartingPayment}
                  >
                    {isStartingPayment ? <Loader2 size={19} className="animate-spin" /> : <ShieldCheck size={19} />}
                    {isStartingPayment ? "Opening checkout..." : "Buy now"}
                  </Button>
                )}
                <Button
                  className="h-11 w-full rounded-full bg-white text-sm font-bold text-[var(--brand)] shadow-sm hover:bg-[var(--brand-soft)] md:h-14 md:text-base"
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

        <section className="mt-6 grid gap-3 md:mt-16 md:grid-cols-2 md:gap-8">
          <div className="surface-card rounded-lg p-4 md:rounded-[2rem] md:p-8">
            <div className="mb-3 flex items-center gap-2 md:mb-6 md:gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e2f7ff] text-[var(--secondary-blue)] md:h-11 md:w-11">
                <Sparkles size={17} className="md:h-[22px] md:w-[22px]" aria-hidden="true" />
              </div>
              <h2 className="text-base font-bold md:text-2xl">Why it may be a match</h2>
            </div>
            <ul className="space-y-3 text-xs font-medium leading-5 text-[var(--ink-soft)] md:space-y-4 md:text-base md:leading-7">
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

          <div className="surface-card rounded-lg p-4 md:rounded-[2rem] md:p-8">
            <div className="mb-3 flex items-center gap-2 md:mb-6 md:gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)] md:h-11 md:w-11">
                <Info size={17} className="md:h-[22px] md:w-[22px]" aria-hidden="true" />
              </div>
              <h2 className="text-base font-bold md:text-2xl">Condition Notes</h2>
            </div>
            <p className="text-xs font-medium leading-5 text-[var(--ink-soft)] md:text-base md:leading-8">
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
      {guestAction && (
        <GuestActionDialog
          action={guestAction}
          listingId={listing.id}
          listingTitle={listing.title}
          busy={guestAction === "buy" ? isStartingPayment : isMessaging}
          onClose={() => setGuestAction(null)}
          onSubmit={handleGuestAction}
        />
      )}
    </div>
  );
}
