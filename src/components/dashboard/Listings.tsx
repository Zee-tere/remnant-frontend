'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle,
  Edit,
  Eye,
  Loader2,
  MessageSquare,
  MoreVertical,
  Package,
  Search,
  SortAsc,
  Trash2,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { listingsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { getApiErrorMessage } from '@/lib/errors';
import { cn, formatCurrency } from '@/lib/utils';

type DashboardSection = 'listings' | 'messages' | 'alerts' | 'upload' | 'profile' | 'settings';

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  intentionTag: string;
  pairingKeyword?: string | null;
  price: string | null;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'EXPIRED' | 'FLAGGED';
  images: string[];
  city?: string | null;
  slug: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ListingsSectionProps {
  onSelectSection?: (section: DashboardSection) => void;
}

const statusMeta: Record<Listing['status'], { label: string; className: string }> = {
  ACTIVE: {
    label: 'Active',
    className: 'bg-[var(--brand-soft)] text-[var(--brand)] dark:bg-[var(--brand-muted)]',
  },
  PAUSED: {
    label: 'Paused',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  },
  EXPIRED: {
    label: 'Expired',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
  FLAGGED: {
    label: 'Flagged',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
};

const conditionLabels: Record<string, string> = {
  NEW: 'New',
  LIKE_NEW: 'Like new',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
};

const intentionLabels: Record<string, string> = {
  SELL: 'Sell',
  TRADE: 'Trade',
  DONATE: 'Donate',
  FIX: 'Fix',
  RECYCLE: 'Recycle',
};

const statIconClasses = [
  'bg-[var(--brand-soft)] text-[var(--brand)] dark:bg-[var(--brand-muted)]',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
];

function StatusBadge({ status }: { status: Listing['status'] }) {
  const meta = statusMeta[status] ?? statusMeta.ACTIVE;
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', meta.className)}>
      {meta.label}
    </span>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ListingsSection({ onSelectSection }: ListingsSectionProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Listing['status']>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'views' | 'price-low' | 'price-high'>('newest');
  const [loading, setLoading] = useState(true);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    condition: 'GOOD',
    intentionTag: 'SELL',
    price: '',
    city: '',
    pairingKeyword: '',
  });

  const fetchListings = useCallback(async () => {
    if (!isAuthenticated) {
      setListings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await listingsApi.getMyListings();
      setListings(Array.isArray(data) ? data : []);
    } catch (error) {
      setListings([]);
      toast.error(getApiErrorMessage(error, 'Could not load your listings'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const filteredListings = useMemo(() => {
    return listings
      .filter((listing) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          listing.title.toLowerCase().includes(query) ||
          listing.description.toLowerCase().includes(query) ||
          listing.category.toLowerCase().includes(query);
        const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return Number(a.price ?? 0) - Number(b.price ?? 0);
        if (sortBy === 'price-high') return Number(b.price ?? 0) - Number(a.price ?? 0);
        if (sortBy === 'views') return (b.viewCount ?? 0) - (a.viewCount ?? 0);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [listings, searchQuery, sortBy, statusFilter]);

  const stats = useMemo(() => {
    const totalViews = listings.reduce((sum, listing) => sum + (listing.viewCount ?? 0), 0);
    const activeListings = listings.filter((listing) => listing.status === 'ACTIVE').length;
    const matchingReady = listings.filter((listing) => Boolean(listing.pairingKeyword)).length;
    const listedValue = listings.reduce((sum, listing) => sum + Number(listing.price ?? 0), 0);

    return [
      { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye },
      { label: 'Active Listings', value: activeListings.toLocaleString(), icon: CheckCircle },
      { label: 'Matching Ready', value: matchingReady.toLocaleString(), icon: MessageSquare },
      { label: 'Listed Value', value: formatCurrency(listedValue), icon: Package },
    ];
  }, [listings]);

  const toggleSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selected) => selected !== id) : [...current, id],
    );
  };

  const openEditor = (listing: Listing) => {
    setEditingListing(listing);
    setEditForm({
      title: listing.title,
      description: listing.description,
      category: listing.category,
      condition: listing.condition,
      intentionTag: listing.intentionTag,
      price: listing.price ?? '',
      city: listing.city ?? '',
      pairingKeyword: listing.pairingKeyword ?? '',
    });
  };

  const handleSaveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingListing) return;

    try {
      const updated = await listingsApi.updateListing(editingListing.id, {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
        condition: editForm.condition,
        intentionTag: editForm.intentionTag,
        price: editForm.price || undefined,
        city: editForm.city || undefined,
        pairingKeyword: editForm.pairingKeyword || undefined,
      });
      setListings((current) => current.map((listing) => (listing.id === editingListing.id ? updated : listing)));
      setEditingListing(null);
      toast.success('Listing updated');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not update listing'));
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this listing? This cannot be undone.');
    if (!confirmed) return;

    try {
      await listingsApi.deleteListing(id);
      setListings((current) => current.filter((listing) => listing.id !== id));
      setSelectedIds((current) => current.filter((selected) => selected !== id));
      toast.success('Listing deleted');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not delete listing'));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(`Delete ${selectedIds.length} selected listing${selectedIds.length === 1 ? '' : 's'}?`);
    if (!confirmed) return;

    setBulkDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => listingsApi.deleteListing(id)));
      setListings((current) => current.filter((listing) => !selectedIds.includes(listing.id)));
      setSelectedIds([]);
      toast.success('Selected listings deleted');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Some listings could not be deleted'));
      fetchListings();
    } finally {
      setBulkDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Loader2 className="animate-spin text-[var(--brand)]" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">My Listings</h1>
          <p className="text-sm text-muted-foreground">
            {listings.length} total listing{listings.length === 1 ? '' : 's'} · {listings.filter((item) => item.status === 'ACTIVE').length} active
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="outline"
            disabled={selectedIds.length === 0 || bulkDeleting}
            onClick={handleBulkDelete}
            className="border-[var(--border)]"
          >
            {bulkDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
            Delete selected
          </Button>
          <Button
            type="button"
            onClick={() => onSelectSection?.('upload')}
            className="bg-[var(--brand)] text-[var(--navy)] hover:bg-[var(--brand-light)]"
          >
            <Package size={16} />
            New Listing
          </Button>
        </div>
      </motion.div>

      <div className="rounded-xl border border-[var(--border)] bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search your listings"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="border-[var(--border)]">
                  Status: {statusFilter === 'all' ? 'All' : statusMeta[statusFilter].label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>All statuses</DropdownMenuItem>
                {Object.entries(statusMeta).map(([status, meta]) => (
                  <DropdownMenuItem key={status} onClick={() => setStatusFilter(status as Listing['status'])}>
                    {meta.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="border-[var(--border)]">
                  <SortAsc size={16} />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest first</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('views')}>Most viewed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('price-low')}>Price: low to high</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('price-high')}>Price: high to low</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={stat.label} className="border-[var(--border)] bg-card">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={cn('rounded-full p-3', statIconClasses[index])}>
                <stat.icon size={22} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredListings.length === 0 ? (
        <Card className="border-[var(--border)] bg-card">
          <CardContent className="flex flex-col items-center px-6 py-14 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-soft)]">
              <Package className="text-[var(--brand)]" size={30} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {listings.length === 0 ? 'No listings yet' : 'No listings match your filters'}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {listings.length === 0
                ? 'Create your first listing and it will appear here with real views, status, and match signals.'
                : 'Try a different search term or clear the status filter.'}
            </p>
            <Button
              type="button"
              onClick={() => onSelectSection?.('upload')}
              className="mt-6 bg-[var(--brand)] text-[var(--navy)] hover:bg-[var(--brand-light)]"
            >
              Create listing
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {filteredListings.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              layout
            >
              <Card className="flex h-full flex-col overflow-hidden border-[var(--border)] bg-card transition-shadow hover:shadow-md">
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--sand)]">
                  {listing.images?.[0] ? (
                    <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
                      <Package size={42} />
                    </div>
                  )}
                  <div className="absolute left-3 top-3">
                    <StatusBadge status={listing.status} />
                  </div>
                  <label className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm dark:bg-black/70">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(listing.id)}
                      onChange={() => toggleSelection(listing.id)}
                      className="h-4 w-4 accent-[var(--brand)]"
                      aria-label={`Select ${listing.title}`}
                    />
                  </label>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="line-clamp-1 text-base">{listing.title}</CardTitle>
                      <p className="mt-1 text-lg font-bold text-[var(--brand)]">
                        {listing.price ? formatCurrency(Number(listing.price)) : 'Free'}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/marketplace/${listing.id}`}>View listing</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditor(listing)}>
                          <Edit className="mr-2" size={14} />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(listing.id)}>
                          <Trash2 className="mr-2" size={14} />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
                </CardHeader>

                <CardContent className="space-y-3 pb-3">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                      {listing.category}
                    </span>
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                      {conditionLabels[listing.condition] ?? listing.condition}
                    </span>
                    <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-[var(--brand)] dark:bg-[var(--brand-muted)]">
                      {intentionLabels[listing.intentionTag] ?? listing.intentionTag}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {(listing.viewCount ?? 0).toLocaleString()} views
                    </span>
                    <span>{formatDate(listing.createdAt)}</span>
                  </div>
                </CardContent>

                <CardFooter className="mt-auto grid grid-cols-2 gap-2 pt-0">
                  <Button type="button" variant="outline" size="sm" asChild className="border-[var(--border)]">
                    <Link href={`/marketplace/${listing.id}`}>View</Link>
                  </Button>
                  <Button type="button" size="sm" onClick={() => openEditor(listing)}>
                    <Edit size={14} />
                    Edit
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {editingListing && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 p-0 sm:items-center sm:justify-center sm:p-4">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSaveEdit}
            className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-[var(--border)] bg-card p-5 shadow-xl sm:max-w-2xl sm:rounded-2xl sm:p-6"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Edit listing</h2>
                <p className="text-sm text-muted-foreground">Update the details currently supported by the API.</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setEditingListing(null)}>
                <X size={18} />
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium">Title</span>
                <Input value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} required />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium">Description</span>
                <textarea
                  value={editForm.description}
                  onChange={(event) => setEditForm({ ...editForm, description: event.target.value })}
                  rows={4}
                  required
                  className="w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Category</span>
                <Input value={editForm.category} onChange={(event) => setEditForm({ ...editForm, category: event.target.value })} required />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">City</span>
                <Input value={editForm.city} onChange={(event) => setEditForm({ ...editForm, city: event.target.value })} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Condition</span>
                <select
                  value={editForm.condition}
                  onChange={(event) => setEditForm({ ...editForm, condition: event.target.value })}
                  className="h-10 w-full rounded-md border border-[var(--border)] bg-background px-3 text-sm"
                >
                  {Object.entries(conditionLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Intent</span>
                <select
                  value={editForm.intentionTag}
                  onChange={(event) => setEditForm({ ...editForm, intentionTag: event.target.value })}
                  className="h-10 w-full rounded-md border border-[var(--border)] bg-background px-3 text-sm"
                >
                  {Object.entries(intentionLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Price</span>
                <Input value={editForm.price} onChange={(event) => setEditForm({ ...editForm, price: event.target.value })} type="number" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Pairing keyword</span>
                <Input value={editForm.pairingKeyword} onChange={(event) => setEditForm({ ...editForm, pairingKeyword: event.target.value })} />
              </label>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setEditingListing(null)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[var(--brand)] text-[var(--navy)] hover:bg-[var(--brand-light)]">
                Save changes
              </Button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
}
