"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Copy, Eye, Loader2, PackageX, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ActionArtwork } from "@/components/brand/ActionArtwork";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listingsApi, userApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import { directContactLabels, directContactMethods, directContactPlaceholders, isPlausibleDirectContact, type DirectContact } from "@/lib/direct-contact";

interface GuestListingManagement {
  id: string;
  title: string;
  slug: string;
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "EXPIRED" | "FLAGGED" | "DELETED";
  version: number;
  expiresAt: string | null;
  image: string | null;
  contact?: DirectContact;
}

export default function ManageGuestListingPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [token, setToken] = useState("");
  const [listing, setListing] = useState<GuestListingManagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<"ACTIVE" | "PAUSED" | "COMPLETED" | null>(null);
  const [deletingData, setDeletingData] = useState(false);
  const [contactMethod, setContactMethod] = useState<DirectContact['method']>('WHATSAPP');
  const [contactValue, setContactValue] = useState('');
  const [updatingContact, setUpdatingContact] = useState(false);

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hashToken = fragment.get("token") || "";
    let storedToken = "";
    try {
      storedToken = window.localStorage.getItem(`remnant-guest-listing:${id}`) || "";
    } catch {
      // A hash token still works when local storage is blocked.
    }
    const managementToken = hashToken || storedToken;
    if (managementToken) {
      try {
        window.localStorage.setItem("remnant-guest-identity", managementToken);
      } catch {
        // The listing-specific token still works when local storage is blocked.
      }
    }
    if (hashToken) {
      try {
        window.localStorage.setItem(`remnant-guest-listing:${id}`, hashToken);
        window.localStorage.setItem("remnant-guest-identity", hashToken);
      } catch {
        // Keep the key in the URL if it cannot be saved locally.
      }
    }
    setToken(managementToken);
    if (!managementToken) {
      setLoading(false);
      return;
    }
    listingsApi.getGuestManagement(id, managementToken)
      .then((data: GuestListingManagement) => {
        setListing(data);
        if (data.contact) {
          setContactMethod(data.contact.method);
          setContactValue(data.contact.value);
        }
      })
      .catch((error) => toast.error(getApiErrorMessage(error, "This management link is invalid or expired.")))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: "ACTIVE" | "PAUSED" | "COMPLETED") => {
    if (!token || !listing) return;
    const confirmed = window.confirm(
      status === "COMPLETED"
        ? "Mark this item as sold? It will leave the public marketplace."
        : status === "ACTIVE" ? "Publish this listing in the marketplace again?" : "Remove this listing from the public marketplace?",
    );
    if (!confirmed) return;
    setUpdating(status);
    try {
      const result = await listingsApi.updateGuestStatus(id, token, status, listing.version);
      setListing((current) => current ? { ...current, status: result.status, version: result.version } : current);
      toast.success(result.message);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update this listing."));
    } finally {
      setUpdating(null);
    }
  };

  const updateContact = async () => {
    if (!token || !listing) return;
    if (!isPlausibleDirectContact(contactMethod, contactValue)) {
      toast.error(`Enter a valid ${directContactLabels[contactMethod]} contact.`);
      return;
    }
    setUpdatingContact(true);
    try {
      const result = await listingsApi.updateGuestContact(id, token, contactMethod, contactValue, listing.version);
      setListing((current) => current ? { ...current, contact: result.contact, version: result.version } : current);
      setContactValue(result.contact.value);
      toast.success(result.message);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not update contact details.'));
    } finally {
      setUpdatingContact(false);
    }
  };

  const copyManagementLink = async () => {
    const url = `${window.location.origin}/manage-listing/${id}#token=${encodeURIComponent(token)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Private management link copied");
    } catch {
      toast.error("Could not copy the link. Save this page in your bookmarks instead.");
    }
  };

  const deleteGuestData = async () => {
    if (!window.confirm('Delete every listing and conversation attached to this guest key and schedule the guest identity for anonymization? This cannot be undone.')) return;
    setDeletingData(true);
    try {
      await userApi.requestGuestDeletion(token);
      window.localStorage.removeItem('remnant-guest-identity');
      window.localStorage.removeItem(`remnant-guest-listing:${id}`);
      window.location.assign('/marketplace');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not delete guest data.'));
      setDeletingData(false);
    }
  };

  if (loading) {
    return <main className="flex min-h-[70dvh] items-center justify-center bg-white"><Loader2 className="animate-spin text-[var(--brand)]" size={28} aria-label="Loading listing" /></main>;
  }

  if (!token || !listing) {
    return (
      <main className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center bg-white px-5 text-center">
        <PackageX size={38} className="text-[var(--brand)]" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold">Management key needed</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">Open the private link you received when this guest listing was published. For safety, Remnant cannot manage the item without that key.</p>
        <Button asChild variant="outline" className="mt-6"><Link href="/marketplace">Back to marketplace</Link></Button>
      </main>
    );
  }

  const isLive = listing.status === "ACTIVE";

  return (
    <main className="min-h-screen bg-white px-4 py-8 md:px-8 md:py-14">
      <section className="mx-auto max-w-xl">
        <div className="flex items-center gap-4 border-b border-[var(--line-soft)] pb-5">
          {listing.image ? <img src={listing.image} alt="" className="h-16 w-16 rounded-xl object-cover" /> : <ActionArtwork name="sell" className="h-16 w-16" />}
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--brand)]">Guest listing</p>
            <h1 className="mt-1 truncate text-2xl font-bold">{listing.title}</h1>
            <p className="mt-1 text-sm font-semibold text-[var(--ink-soft)]">{isLive ? "Live in the marketplace" : listing.status === "COMPLETED" ? "Marked as sold" : "Removed from the marketplace"}</p>
            {isLive && listing.expiresAt && <p className="mt-1 text-xs text-[var(--muted-foreground)]">Guest listing ends {new Date(listing.expiresAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>}
          </div>
        </div>

        {isLive ? (
          <div className="py-7">
            <h2 className="text-xl font-bold">What happened to the item?</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">Use this page when the item is sold or no longer available. That keeps buyers from contacting you about an old listing.</p>
            <div className="mt-6 space-y-3">
              <Button type="button" onClick={() => void updateStatus("COMPLETED")} disabled={Boolean(updating)} className="h-12 w-full rounded-full bg-[var(--brand)] font-bold text-white hover:bg-[var(--brand-dark)]">
                {updating === "COMPLETED" ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
                Mark as sold
              </Button>
              <Button type="button" variant="outline" onClick={() => void updateStatus("PAUSED")} disabled={Boolean(updating)} className="h-12 w-full rounded-full font-bold">
                {updating === "PAUSED" ? <Loader2 size={17} className="animate-spin" /> : <PackageX size={17} />}
                Remove from marketplace
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <CheckCircle2 size={38} className="mx-auto text-[var(--brand)]" />
            <h2 className="mt-3 text-xl font-bold">This listing is no longer public</h2>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">Buyers will no longer see it in the marketplace.</p>
            {(listing.status === "PAUSED" || listing.status === "EXPIRED") && (
              <Button type="button" onClick={() => void updateStatus("ACTIVE")} disabled={Boolean(updating)} className="mt-5 bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]">
                {updating === "ACTIVE" && <Loader2 size={16} className="animate-spin" />}
                Publish again
              </Button>
            )}
          </div>
        )}

        <div className="border-t border-[var(--line-soft)] py-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">Public contact</p>
          <h2 className="mt-1 text-xl font-bold tracking-[-0.025em]">How buyers reach you</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">This appears on your listing. Remnant does not create an inbox for guest sellers.</p>
          <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Contact method">
            {directContactMethods.map((method) => <button key={method} type="button" role="radio" aria-checked={contactMethod === method} onClick={() => setContactMethod(method)} className={`h-11 rounded-xl border text-xs font-bold ${contactMethod === method ? 'border-[#111] bg-[#111] text-white' : 'border-black/15 bg-white text-[#333]'}`}>{directContactLabels[method]}</button>)}
          </div>
          <Input value={contactValue} onChange={(event) => setContactValue(event.target.value)} placeholder={directContactPlaceholders[contactMethod]} className="mt-3 h-12 rounded-xl border-black/15 bg-white px-4 text-base" />
          <Button type="button" onClick={() => void updateContact()} disabled={updatingContact} className="mt-3 h-12 w-full rounded-xl bg-[#111] font-bold text-white hover:bg-black">
            {updatingContact ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save contact
          </Button>
        </div>

        <div className="flex flex-col gap-2 border-t border-[var(--line-soft)] pt-5 sm:flex-row">
          {isLive && <Button asChild variant="ghost" className="justify-start px-2 font-bold text-[var(--brand)]"><Link href={`/marketplace/${listing.slug || listing.id}`}><Eye size={16} /> View listing</Link></Button>}
          <Button type="button" variant="ghost" onClick={() => void copyManagementLink()} className="justify-start px-2 font-bold text-[var(--ink-soft)]"><Copy size={16} /> Copy private management link</Button>
        </div>
        <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">Keep this private link. Anyone with it can remove this guest listing.</p>
        <Button type="button" variant="ghost" disabled={deletingData} onClick={() => void deleteGuestData()} className="mt-4 justify-start px-2 font-bold text-red-700">
          {deletingData ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          Delete my guest data
        </Button>
      </section>
    </main>
  );
}
