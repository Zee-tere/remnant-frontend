"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Copy, Eye, Loader2, PackageX } from "lucide-react";
import { toast } from "sonner";
import { ActionArtwork } from "@/components/brand/ActionArtwork";
import { Button } from "@/components/ui/button";
import { listingsApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";

interface GuestListingManagement {
  id: string;
  title: string;
  slug: string;
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "EXPIRED" | "FLAGGED";
  image: string | null;
}

export default function ManageGuestListingPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [token, setToken] = useState("");
  const [listing, setListing] = useState<GuestListingManagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<"PAUSED" | "COMPLETED" | null>(null);

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
    if (hashToken) {
      try {
        window.localStorage.setItem(`remnant-guest-listing:${id}`, hashToken);
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
      .then((data: GuestListingManagement) => setListing(data))
      .catch((error) => toast.error(getApiErrorMessage(error, "This management link is invalid or expired.")))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: "PAUSED" | "COMPLETED") => {
    if (!token) return;
    const confirmed = window.confirm(
      status === "COMPLETED"
        ? "Mark this item as sold? It will disappear from the public market."
        : "Remove this listing from the public market?",
    );
    if (!confirmed) return;
    setUpdating(status);
    try {
      const result = await listingsApi.updateGuestStatus(id, token, status);
      setListing((current) => current ? { ...current, status: result.status } : current);
      toast.success(result.message);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update this listing."));
    } finally {
      setUpdating(null);
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

  if (loading) {
    return <main className="flex min-h-[70dvh] items-center justify-center bg-white"><Loader2 className="animate-spin text-[var(--brand)]" size={28} aria-label="Loading listing" /></main>;
  }

  if (!token || !listing) {
    return (
      <main className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center bg-white px-5 text-center">
        <PackageX size={38} className="text-[var(--brand)]" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold">Management key needed</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">Open the private link you received when this guest listing was published. For safety, Remnant cannot manage the item without that key.</p>
        <Button asChild variant="outline" className="mt-6 rounded-full"><Link href="/marketplace">Back to the market</Link></Button>
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
            <p className="mt-1 text-sm font-semibold text-[var(--ink-soft)]">{isLive ? "Live in the market" : listing.status === "COMPLETED" ? "Marked as sold" : "Removed from the market"}</p>
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
                Remove from market
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <CheckCircle2 size={38} className="mx-auto text-[var(--brand)]" />
            <h2 className="mt-3 text-xl font-bold">This listing is no longer public</h2>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">Buyers will no longer see it in the marketplace.</p>
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-[var(--line-soft)] pt-5 sm:flex-row">
          {isLive && <Button asChild variant="ghost" className="justify-start px-2 font-bold text-[var(--brand)]"><Link href={`/marketplace/${listing.slug || listing.id}`}><Eye size={16} /> View listing</Link></Button>}
          <Button type="button" variant="ghost" onClick={() => void copyManagementLink()} className="justify-start px-2 font-bold text-[var(--ink-soft)]"><Copy size={16} /> Copy private management link</Button>
        </div>
        <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">Keep this private link. Anyone with it can remove this guest listing.</p>
      </section>
    </main>
  );
}
