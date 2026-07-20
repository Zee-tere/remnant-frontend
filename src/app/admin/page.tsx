"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ExternalLink,
  Flag,
  LayoutDashboard,
  Loader2,
  Mail,
  MessageSquare,
  Package,
  Phone,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { getApiErrorMessage } from "@/lib/errors";
import { NameAvatar } from "@/components/ui/name-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Tab = "overview" | "listings" | "reports" | "users";
type Metrics = {
  totalUsers: number;
  activeListings: number;
  flaggedListings: number;
  openReports: number;
  bannedUsers: number;
};
type AdminListing = {
  id: string;
  title: string;
  slug: string;
  status: string;
  intentionTag: string;
  category: string;
  city?: string | null;
  viewCount: number;
  isGuestListing: boolean;
  guestContact?: { phone?: string; email?: string; telegram?: string } | null;
  createdAt: string;
  user: { id: string; name: string; email: string; bannedAt?: string | null };
};
type AdminReport = {
  id: string;
  targetType: "LISTING" | "USER";
  targetId: string;
  reason: string;
  status: string;
  resolution?: string | null;
  createdAt: string;
  reporter: { id: string; name: string; email: string };
  target?: { id: string; title?: string; slug?: string; name?: string; email?: string; status?: string } | null;
};
type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  trustTier: string;
  bannedAt?: string | null;
  createdAt: string;
  _count: { listings: number };
};

const tabs = [
  { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
  { id: "listings" as const, label: "Listings", icon: Package },
  { id: "reports" as const, label: "Reports", icon: AlertTriangle },
  { id: "users" as const, label: "Users", icon: Users },
];

const statusTone: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  FLAGGED: "bg-amber-50 text-amber-800",
  PAUSED: "bg-slate-100 text-slate-700",
  COMPLETED: "bg-blue-50 text-blue-700",
  OPEN: "bg-red-50 text-red-700",
  RESOLVED: "bg-emerald-50 text-emerald-700",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function StatusBadge({ value }: { value: string }) {
  return <span className={`inline-flex rounded-full px-2 py-1 text-[0.68rem] font-bold ${statusTone[value] || "bg-[var(--sand)] text-[var(--ink-soft)]"}`}>{value.replaceAll("_", " ")}</span>;
}

function MessageDialog({ target, busy, onClose, onSend }: { target: { id: string; name: string }; busy: boolean; onClose: () => void; onSend: (message: string) => Promise<void> }) {
  const [message, setMessage] = useState("");
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/25 sm:items-center sm:p-5">
      <form onSubmit={(event) => { event.preventDefault(); void onSend(message); }} className="w-full space-y-4 rounded-t-lg bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-lg" role="dialog" aria-modal="true" aria-labelledby="admin-message-title">
        <div className="flex items-start justify-between gap-4">
          <div><h2 id="admin-message-title" className="text-lg font-bold">Message {target.name}</h2><p className="mt-1 text-sm text-[var(--muted-foreground)]">This appears in the seller&apos;s alerts.</p></div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--sand)]" aria-label="Close"><X size={18} /></button>
        </div>
        <Textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={1000} rows={5} required placeholder="Write a clear moderation or support message" />
        <Button type="submit" disabled={busy || !message.trim()} className="h-11 w-full rounded-full bg-[var(--brand)] font-bold text-white hover:bg-[var(--brand-dark)]">
          {busy ? <Loader2 size={17} className="animate-spin" /> : <MessageSquare size={17} />} Send alert
        </Button>
      </form>
    </div>
  );
}

function GuestContactDialog({ target, onClose }: { target: { name: string; contact: NonNullable<AdminListing["guestContact"]> }; onClose: () => void }) {
  const methods = [
    target.contact.phone ? { label: target.contact.phone, href: `tel:${target.contact.phone.replace(/[^+\d]/g, "")}`, icon: Phone } : null,
    target.contact.email ? { label: target.contact.email, href: `mailto:${target.contact.email}`, icon: Mail } : null,
    target.contact.telegram ? { label: target.contact.telegram.replace(/^https?:\/\//, ""), href: target.contact.telegram, icon: Send } : null,
  ].filter((method): method is NonNullable<typeof method> => Boolean(method));

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/25 sm:items-center sm:p-5">
      <section className="w-full rounded-t-lg bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-lg" role="dialog" aria-modal="true" aria-labelledby="guest-admin-contact-title">
        <div className="flex items-start justify-between gap-4"><div><h2 id="guest-admin-contact-title" className="text-lg font-bold">Contact {target.name}</h2><p className="mt-1 text-sm text-[var(--muted-foreground)]">Guest seller contact methods.</p></div><button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--sand)]" aria-label="Close"><X size={18} /></button></div>
        <div className="mt-5 divide-y divide-[var(--border)] overflow-hidden rounded-lg border border-[var(--border)]">{methods.map((method) => { const Icon = method.icon; return <a key={method.href} href={method.href} target={method.href.startsWith("https://") ? "_blank" : undefined} rel={method.href.startsWith("https://") ? "noreferrer" : undefined} className="flex min-h-14 items-center gap-3 px-4 py-3 hover:bg-[var(--brand-soft)]"><Icon size={17} className="text-[var(--brand)]" /><span className="min-w-0 flex-1 truncate text-sm font-bold">{method.label}</span><ExternalLink size={14} className="text-[var(--muted-foreground)]" /></a>; })}</div>
      </section>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [listingStatus, setListingStatus] = useState("");
  const [reportStatus, setReportStatus] = useState("OPEN");
  const [messageTarget, setMessageTarget] = useState<{ id: string; name: string } | null>(null);
  const [guestContactTarget, setGuestContactTarget] = useState<{ name: string; contact: NonNullable<AdminListing["guestContact"]> } | null>(null);

  const authorized = hasHydrated && isAuthenticated && user?.role === "ADMIN";

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.replace(`/login?redirect=${encodeURIComponent("/admin")}`);
    else if (user?.role !== "ADMIN") router.replace("/");
  }, [hasHydrated, isAuthenticated, router, user?.role]);

  const loadData = useCallback(async (tab: Tab) => {
    if (!authorized) return;
    setLoading(true);
    try {
      if (tab === "overview") setMetrics(await adminApi.getDashboard() as Metrics);
      if (tab === "listings") {
        const result = await adminApi.getListings({ ...(appliedSearch ? { search: appliedSearch } : {}), ...(listingStatus ? { status: listingStatus } : {}), limit: 50 });
        setListings(Array.isArray(result.listings) ? result.listings : []);
      }
      if (tab === "reports") {
        const result = await adminApi.getReports({ ...(reportStatus ? { status: reportStatus } : {}), limit: 50 });
        setReports(Array.isArray(result.reports) ? result.reports : []);
      }
      if (tab === "users") {
        const result = await adminApi.getUsers({ ...(appliedSearch ? { search: appliedSearch } : {}), limit: 50 });
        setUsers(Array.isArray(result.users) ? result.users : []);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not load administration data"));
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, authorized, listingStatus, reportStatus]);

  useEffect(() => { void loadData(activeTab); }, [activeTab, loadData]);

  const runAction = async (id: string, action: () => Promise<unknown>, success: string) => {
    setActionId(id);
    try {
      await action();
      toast.success(success);
      await Promise.all([loadData(activeTab), adminApi.getDashboard().then((data) => setMetrics(data as Metrics))]);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "The action could not be completed"));
    } finally {
      setActionId(null);
    }
  };

  const openSellerContact = (listing: AdminListing) => {
    const contact = listing.guestContact;
    if (!contact || (!contact.phone && !contact.email && !contact.telegram)) {
      toast.error("This guest seller did not provide a contact method.");
      return;
    }
    setGuestContactTarget({ name: listing.user.name || "guest seller", contact });
  };

  if (!hasHydrated || !authorized) {
    return <div className="flex min-h-[55vh] items-center justify-center text-[var(--brand)]"><Loader2 className="animate-spin" aria-label="Checking administrator access" /></div>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-3 pb-24 pt-4 md:px-8 md:pb-12 md:pt-8">
      <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 md:flex-row md:items-end md:justify-between">
        <div><div className="flex items-center gap-2 text-xs font-bold uppercase text-[var(--brand)]"><ShieldCheck size={15} /> Administrator</div><h1 className="mt-2 text-2xl font-bold md:text-4xl">Marketplace control</h1><p className="mt-1 text-sm text-[var(--muted-foreground)]">Listings, reports, and member safety.</p></div>
        <Button type="button" variant="outline" onClick={() => void loadData(activeTab)} disabled={loading} className="h-10 self-start rounded-full border-[var(--border)] bg-white px-4 font-bold md:self-auto"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh</Button>
      </header>

      <nav className="mt-4 grid grid-cols-4 gap-1 border-b border-[var(--border)]" aria-label="Administration sections">
        {tabs.map((tab) => { const Icon = tab.icon; const selected = activeTab === tab.id; return (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`flex min-h-12 items-center justify-center gap-1.5 border-b-2 px-1 text-xs font-bold transition-colors md:gap-2 md:text-sm ${selected ? "border-[var(--brand)] text-[var(--brand)]" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`} aria-current={selected ? "page" : undefined}><Icon size={16} /><span className="truncate">{tab.label}</span></button>
        ); })}
      </nav>

      {activeTab === "overview" && (
        <section className="py-6">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-4">
            {[
              { label: "Members", value: metrics?.totalUsers ?? 0, icon: Users },
              { label: "Active listings", value: metrics?.activeListings ?? 0, icon: Package },
              { label: "Open reports", value: metrics?.openReports ?? 0, icon: AlertTriangle },
              { label: "Flagged", value: metrics?.flaggedListings ?? 0, icon: Flag },
              { label: "Suspended", value: metrics?.bannedUsers ?? 0, icon: Ban },
            ].map((metric) => { const Icon = metric.icon; return <button type="button" key={metric.label} onClick={() => setActiveTab(metric.label === "Members" || metric.label === "Suspended" ? "users" : metric.label === "Open reports" ? "reports" : "listings")} className="surface-card min-h-24 rounded-lg p-3 text-left transition-colors hover:border-[var(--brand)] md:min-h-32 md:p-5"><Icon size={18} className="text-[var(--brand)]" /><strong className="mt-3 block text-xl md:text-3xl">{loading && !metrics ? "-" : metric.value}</strong><span className="mt-1 block text-xs font-semibold text-[var(--muted-foreground)] md:text-sm">{metric.label}</span></button>; })}
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <button type="button" onClick={() => setActiveTab("reports")} className="flex min-h-20 items-center gap-4 border-y border-[var(--border)] px-2 py-4 text-left hover:bg-[var(--brand-soft)]"><span className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-700"><AlertTriangle size={20} /></span><span><strong className="block">Review reports</strong><span className="text-sm text-[var(--muted-foreground)]">Check member reports and take action.</span></span></button>
            <button type="button" onClick={() => setActiveTab("listings")} className="flex min-h-20 items-center gap-4 border-y border-[var(--border)] px-2 py-4 text-left hover:bg-[var(--brand-soft)]"><span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]"><Package size={20} /></span><span><strong className="block">Manage listings</strong><span className="text-sm text-[var(--muted-foreground)]">Flag, remove, restore, or contact a seller.</span></span></button>
          </div>
        </section>
      )}

      {(activeTab === "listings" || activeTab === "users") && (
        <form onSubmit={(event) => { event.preventDefault(); const nextSearch = search.trim(); if (nextSearch === appliedSearch) void loadData(activeTab); else setAppliedSearch(nextSearch); }} className="mt-5 flex gap-2">
          <div className="relative min-w-0 flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 rounded-full bg-white pl-9" placeholder={activeTab === "users" ? "Search members" : "Search listings or sellers"} /></div>
          {activeTab === "listings" && <select value={listingStatus} onChange={(event) => setListingStatus(event.target.value)} className="h-11 max-w-32 rounded-full border border-[var(--border)] bg-white px-3 text-sm font-bold"><option value="">All</option><option>ACTIVE</option><option>FLAGGED</option><option>PAUSED</option><option>COMPLETED</option></select>}
          <Button type="submit" className="h-11 rounded-full bg-[var(--brand)] px-4 text-white"><Search size={16} /><span className="hidden sm:inline">Find</span></Button>
        </form>
      )}

      {activeTab === "reports" && <div className="mt-5 flex justify-end"><select value={reportStatus} onChange={(event) => setReportStatus(event.target.value)} className="h-11 rounded-full border border-[var(--border)] bg-white px-4 text-sm font-bold"><option value="">All reports</option><option value="OPEN">Open</option><option value="RESOLVED">Resolved</option><option value="REVIEWED">Reviewed</option></select></div>}

      {loading && activeTab !== "overview" ? <div className="flex min-h-56 items-center justify-center text-[var(--brand)]"><Loader2 className="animate-spin" /></div> : null}

      {!loading && activeTab === "listings" && <section className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">{listings.length === 0 ? <p className="py-16 text-center text-sm text-[var(--muted-foreground)]">No listings match this view.</p> : listings.map((listing) => (
        <article key={listing.id} className="grid gap-3 py-4 md:grid-cols-[minmax(0,1.5fr)_0.8fr_0.7fr_auto] md:items-center">
          <div className="min-w-0"><div className="flex items-center gap-2"><h2 className="truncate font-bold">{listing.title}</h2><StatusBadge value={listing.status} /></div><p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">{listing.user.name} · {listing.category} · {listing.city || "No state"}</p><p className="mt-1 text-xs text-[var(--muted-foreground)]">{formatDate(listing.createdAt)} · {listing.viewCount} views</p></div>
          <div className="text-xs"><p className="font-semibold">{listing.isGuestListing ? "Guest seller" : listing.user.email}</p><p className="mt-1 text-[var(--muted-foreground)]">{listing.intentionTag}</p></div>
          <div className="flex items-center gap-2"><Link href={`/marketplace/${listing.slug || listing.id}`} target="_blank" className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)]" aria-label="View listing"><ExternalLink size={16} /></Link><button type="button" onClick={() => listing.isGuestListing ? openSellerContact(listing) : setMessageTarget({ id: listing.user.id, name: listing.user.name })} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)]" aria-label="Contact seller"><Mail size={16} /></button></div>
          <div className="flex flex-wrap gap-2 md:justify-end">{listing.status !== "FLAGGED" && <Button type="button" variant="outline" disabled={actionId === listing.id} onClick={() => void runAction(listing.id, () => adminApi.updateListingStatus(listing.id, "FLAGGED"), "Listing flagged")} className="h-9 rounded-full text-xs"><Flag size={14} /> Flag</Button>}{listing.status !== "ACTIVE" && <Button type="button" variant="outline" disabled={actionId === listing.id} onClick={() => void runAction(listing.id, () => adminApi.updateListingStatus(listing.id, "ACTIVE"), "Listing restored")} className="h-9 rounded-full text-xs"><CheckCircle2 size={14} /> Restore</Button>}<Button type="button" variant="outline" disabled={actionId === listing.id} onClick={() => { if (window.confirm("Remove this listing from the public marketplace?")) void runAction(listing.id, () => adminApi.removeListing(listing.id), "Listing removed"); }} className="h-9 rounded-full border-red-200 text-xs text-red-700"><Trash2 size={14} /> Remove</Button></div>
        </article>
      ))}</section>}

      {!loading && activeTab === "reports" && <section className="mt-4 grid gap-3">{reports.length === 0 ? <p className="border-y border-[var(--border)] py-16 text-center text-sm text-[var(--muted-foreground)]">No reports match this view.</p> : reports.map((report) => (
        <article key={report.id} className="surface-card rounded-lg p-4 md:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><StatusBadge value={report.status} /><span className="text-xs font-bold text-[var(--muted-foreground)]">{report.targetType}</span></div><h2 className="mt-3 font-bold">{report.target?.title || report.target?.name || "Unavailable target"}</h2><p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">{report.reason}</p><p className="mt-2 text-xs text-[var(--muted-foreground)]">Reported by {report.reporter.name} · {formatDate(report.createdAt)}</p></div>{report.target?.slug && <Link href={`/marketplace/${report.target.slug}`} target="_blank" className="flex h-10 items-center gap-2 rounded-full border border-[var(--border)] px-3 text-xs font-bold"><ExternalLink size={14} /> View</Link>}</div>{report.status === "OPEN" && <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">{report.targetType === "LISTING" ? <><Button type="button" variant="outline" disabled={actionId === report.id} onClick={() => void runAction(report.id, () => adminApi.actOnReport(report.id, "FLAG_LISTING"), "Report resolved and listing flagged")} className="h-9 rounded-full text-xs"><Flag size={14} /> Flag listing</Button><Button type="button" variant="outline" disabled={actionId === report.id} onClick={() => void runAction(report.id, () => adminApi.actOnReport(report.id, "REMOVE_LISTING"), "Report resolved and listing removed")} className="h-9 rounded-full border-red-200 text-xs text-red-700"><Trash2 size={14} /> Remove listing</Button></> : <Button type="button" variant="outline" disabled={actionId === report.id} onClick={() => void runAction(report.id, () => adminApi.actOnReport(report.id, "BAN_USER"), "Report resolved and user suspended")} className="h-9 rounded-full border-red-200 text-xs text-red-700"><Ban size={14} /> Suspend user</Button>}<Button type="button" variant="outline" disabled={actionId === report.id} onClick={() => void runAction(report.id, () => adminApi.actOnReport(report.id, "DISMISS"), "Report dismissed")} className="h-9 rounded-full text-xs"><CheckCircle2 size={14} /> Dismiss</Button></div>}</article>
      ))}</section>}

      {!loading && activeTab === "users" && <section className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">{users.length === 0 ? <p className="py-16 text-center text-sm text-[var(--muted-foreground)]">No members match this search.</p> : users.map((member) => (
        <article key={member.id} className="grid gap-3 py-4 md:grid-cols-[minmax(0,1.4fr)_0.6fr_0.8fr_auto] md:items-center"><div className="flex min-w-0 items-center gap-3"><NameAvatar name={member.name} className="h-10 w-10 shrink-0 text-sm" /><div className="min-w-0"><h2 className="truncate font-bold">{member.name}</h2><p className="truncate text-xs text-[var(--muted-foreground)]">{member.email}</p></div></div><div className="text-xs"><strong>{member._count.listings}</strong> listings<p className="mt-1 text-[var(--muted-foreground)]">Joined {formatDate(member.createdAt)}</p></div><select value={member.role} disabled={member.id === user?.id || actionId === member.id} onChange={(event) => void runAction(member.id, () => adminApi.updateUser(member.id, { role: event.target.value }), "Member role updated")} className="h-10 rounded-full border border-[var(--border)] bg-white px-3 text-xs font-bold"><option value="USER">User</option><option value="MODERATOR">Moderator</option><option value="ADMIN">Administrator</option></select><div className="flex gap-2 md:justify-end"><button type="button" onClick={() => setMessageTarget({ id: member.id, name: member.name })} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)]" aria-label={`Message ${member.name}`}><Mail size={16} /></button><Button type="button" variant="outline" disabled={member.id === user?.id || actionId === member.id} onClick={() => void runAction(member.id, () => adminApi.updateUser(member.id, { bannedAt: member.bannedAt ? null : new Date().toISOString() }), member.bannedAt ? "Member restored" : "Member suspended")} className={`h-10 rounded-full text-xs ${member.bannedAt ? "text-[var(--brand)]" : "border-red-200 text-red-700"}`}>{member.bannedAt ? <RefreshCw size={14} /> : <Ban size={14} />}{member.bannedAt ? "Restore" : "Suspend"}</Button></div></article>
      ))}</section>}

      {messageTarget && <MessageDialog target={messageTarget} busy={actionId === messageTarget.id} onClose={() => setMessageTarget(null)} onSend={async (message) => { await runAction(messageTarget.id, () => adminApi.messageUser(messageTarget.id, message), "Seller notified"); setMessageTarget(null); }} />}
      {guestContactTarget && <GuestContactDialog target={guestContactTarget} onClose={() => setGuestContactTarget(null)} />}
    </main>
  );
}
