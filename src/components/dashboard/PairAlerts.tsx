'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BellRing,
  ChevronRight,
  Loader2,
  MapPin,
  Pause,
  Play,
  Plus,
  ScanSearch,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { pairAlertsApi } from '@/lib/api';
import { listingCategories } from '@/lib/categories';
import { nigerianStates } from '@/lib/nigeria-locations';
import { getApiErrorMessage } from '@/lib/errors';
import { formatCurrency } from '@/lib/utils';

interface PairAlertMatch {
  id: string;
  score: number;
  status: 'PENDING' | 'VIEWED' | 'DISMISSED' | 'COMPLETED';
  listing: {
    id: string;
    slug?: string;
    title: string;
    price?: string | null;
    city?: string | null;
    images?: string[];
    intentionTag: string;
  };
}

interface PairAlertRecord {
  id: string;
  query: string;
  description?: string | null;
  category: string;
  city?: string | null;
  budget?: string | null;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  createdAt: string;
  matches: PairAlertMatch[];
}

const emptyForm = {
  query: '',
  description: '',
  category: '',
  city: '',
  budget: '',
  brand: '',
  model: '',
  side: '',
};

function AlertForm({ busy, onClose, onCreate }: {
  busy: boolean;
  onClose: () => void;
  onCreate: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const [form, setForm] = useState(emptyForm);
  const setValue = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/25 sm:items-center sm:p-5" role="presentation">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onCreate({
            query: form.query.trim(),
            description: form.description.trim() || undefined,
            category: form.category,
            city: form.city || undefined,
            budget: form.budget || undefined,
            compatibilityAttributes: {
              brand: form.brand.trim() || undefined,
              model: form.model.trim() || undefined,
              side: form.side || undefined,
            },
          });
        }}
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-xl bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 shadow-2xl sm:max-w-xl sm:rounded-xl sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pair-alert-form-title"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="pair-alert-form-title" className="text-lg font-bold sm:text-xl">Create a pair alert</h2>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)] sm:text-sm">Saved privately to your profile.</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--sand)]" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-xs font-bold sm:text-sm">What piece do you need?</span>
            <Input value={form.query} onChange={(event) => setValue('query', event.target.value)} minLength={2} maxLength={120} required className="h-11 rounded-lg text-base sm:rounded-full" placeholder="Lid for a 24 cm cooking pot" autoFocus />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold sm:text-sm">Category</span>
            <select value={form.category} onChange={(event) => setValue('category', event.target.value)} required className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-base outline-none focus:border-[var(--brand)] sm:rounded-full">
              <option value="">Choose category</option>
              {listingCategories.map((category) => <option key={category.label} value={category.label}>{category.label}</option>)}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold sm:text-sm">Preferred state <span className="font-medium text-[var(--muted-foreground)]">(optional)</span></span>
            <select value={form.city} onChange={(event) => setValue('city', event.target.value)} className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-base outline-none focus:border-[var(--brand)] sm:rounded-full">
              <option value="">Any state</option>
              {nigerianStates.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold sm:text-sm">Brand <span className="font-medium text-[var(--muted-foreground)]">(optional)</span></span>
            <Input value={form.brand} onChange={(event) => setValue('brand', event.target.value)} maxLength={80} className="h-11 rounded-lg text-base sm:rounded-full" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold sm:text-sm">Model <span className="font-medium text-[var(--muted-foreground)]">(optional)</span></span>
            <Input value={form.model} onChange={(event) => setValue('model', event.target.value)} maxLength={80} className="h-11 rounded-lg text-base sm:rounded-full" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold sm:text-sm">Side or position</span>
            <select value={form.side} onChange={(event) => setValue('side', event.target.value)} className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-base outline-none focus:border-[var(--brand)] sm:rounded-full">
              <option value="">Not applicable</option>
              {['left', 'right', 'top', 'bottom', 'front', 'back', 'upper', 'lower'].map((side) => <option key={side} value={side}>{side[0].toUpperCase() + side.slice(1)}</option>)}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold sm:text-sm">Maximum budget <span className="font-medium text-[var(--muted-foreground)]">(optional)</span></span>
            <Input type="number" min="0" step="0.01" value={form.budget} onChange={(event) => setValue('budget', event.target.value)} className="h-11 rounded-lg text-base sm:rounded-full" placeholder="NGN" />
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-xs font-bold sm:text-sm">Extra detail <span className="font-medium text-[var(--muted-foreground)]">(optional)</span></span>
            <Textarea value={form.description} onChange={(event) => setValue('description', event.target.value)} maxLength={1000} rows={3} className="min-h-[86px] rounded-lg text-base sm:rounded-xl" placeholder="Colour, dimensions, or anything that helps identify the right fit" />
          </label>
        </div>

        <Button type="submit" disabled={busy} className="mt-4 h-11 w-full rounded-full bg-[var(--brand)] font-bold text-white">
          {busy ? <Loader2 size={17} className="animate-spin" /> : <BellRing size={17} />}
          {busy ? 'Saving alert...' : 'Notify me when it appears'}
        </Button>
      </form>
    </div>
  );
}

export default function PairAlertsSection() {
  const searchParams = useSearchParams();
  const [alerts, setAlerts] = useState<PairAlertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(searchParams.get('create') === '1');

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await pairAlertsApi.getAlerts();
      setAlerts(Array.isArray(result) ? result : []);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not load pair alerts'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  const totalMatches = useMemo(() => alerts.reduce((sum, alert) => sum + alert.matches.length, 0), [alerts]);

  const createAlert = async (payload: Record<string, unknown>) => {
    setBusyId('create');
    try {
      await pairAlertsApi.createAlert(payload);
      toast.success('Pair alert saved', { description: 'It stays private. We will notify you when a likely match appears.' });
      setShowForm(false);
      await loadAlerts();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not create pair alert'));
    } finally {
      setBusyId(null);
    }
  };

  const toggleAlert = async (alert: PairAlertRecord) => {
    setBusyId(alert.id);
    try {
      await pairAlertsApi.updateAlert(alert.id, { status: alert.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' });
      await loadAlerts();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not update pair alert'));
    } finally {
      setBusyId(null);
    }
  };

  const deleteAlert = async (alert: PairAlertRecord) => {
    if (!window.confirm(`Delete the alert for “${alert.query}”?`)) return;
    setBusyId(alert.id);
    try {
      await pairAlertsApi.deleteAlert(alert.id);
      setAlerts((current) => current.filter((item) => item.id !== alert.id));
      toast.success('Pair alert deleted');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not delete pair alert'));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <div className="flex min-h-[280px] items-center justify-center"><Loader2 className="animate-spin text-[var(--brand)]" size={25} /></div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-3 md:space-y-6">
      <header className="flex items-center justify-between gap-3 border-b border-[var(--border)]/70 pb-3 md:pb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ScanSearch size={20} className="shrink-0 text-[var(--brand)]" />
            <h1 className="text-xl font-bold md:text-3xl">Pair alerts</h1>
          </div>
          <p className="mt-1 text-xs text-[var(--muted-foreground)] md:text-sm">{alerts.length} saved · {totalMatches} likely {totalMatches === 1 ? 'match' : 'matches'}</p>
        </div>
        <Button type="button" onClick={() => setShowForm(true)} className="h-10 shrink-0 rounded-full bg-[var(--brand)] px-3 text-xs font-bold text-white md:px-5 md:text-sm">
          <Plus size={16} />
          New alert
        </Button>
      </header>

      <div className="flex items-start gap-2.5 rounded-lg border border-[var(--border)]/70 bg-white px-3 py-2.5 text-xs leading-5 text-[var(--ink-soft)] md:px-4 md:py-3 md:text-sm">
        <BellRing size={16} className="mt-0.5 shrink-0 text-[var(--brand)]" />
        Alerts are private saved searches. They never appear as marketplace listings.
      </div>

      {alerts.length === 0 ? (
        <section className="flex min-h-[240px] flex-col items-center justify-center border-y border-[var(--border)] px-5 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]"><ScanSearch size={21} /></span>
          <h2 className="mt-3 text-base font-bold">Nothing on watch yet</h2>
          <p className="mt-1 max-w-sm text-sm text-[var(--muted-foreground)]">Save a missing piece, part, or single item and Remnant will compare it with new listings.</p>
          <Button type="button" onClick={() => setShowForm(true)} variant="outline" className="mt-4 rounded-full border-[var(--border)] font-bold">Create your first alert</Button>
        </section>
      ) : (
        <section className="divide-y divide-[var(--border)] overflow-hidden rounded-lg border border-[var(--border)] bg-white">
          {alerts.map((alert) => (
            <article key={alert.id} className="p-3 md:p-5">
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${alert.status === 'ACTIVE' ? 'bg-[var(--brand)]' : 'bg-[var(--muted-foreground)]/40'}`} aria-label={alert.status === 'ACTIVE' ? 'Active alert' : 'Paused alert'} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-bold md:text-base">{alert.query}</h2>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[0.7rem] font-medium text-[var(--muted-foreground)] md:text-xs">
                        <span>{alert.category}</span>
                        {alert.city && <span className="inline-flex items-center gap-1"><MapPin size={11} />{alert.city}</span>}
                        {alert.budget && <span>Up to {formatCurrency(Number(alert.budget))}</span>}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button type="button" onClick={() => void toggleAlert(alert)} disabled={busyId === alert.id} className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]" aria-label={alert.status === 'ACTIVE' ? 'Pause alert' : 'Resume alert'}>
                        {busyId === alert.id ? <Loader2 size={14} className="animate-spin" /> : alert.status === 'ACTIVE' ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <button type="button" onClick={() => void deleteAlert(alert)} disabled={busyId === alert.id} className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-red-50 hover:text-red-600" aria-label="Delete alert"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  {alert.matches.length > 0 ? (
                    <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                      {alert.matches.slice(0, 4).map((match) => (
                        <Link key={match.id} href={`/marketplace/${match.listing.slug || match.listing.id}`} className="group flex min-w-0 items-center gap-2 rounded-md border border-[var(--border)]/70 p-1.5 transition-colors hover:border-[var(--brand)]/35 hover:bg-[var(--brand-soft)]/45">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[var(--sand)]">
                            {match.listing.images?.[0] ? <img src={match.listing.images[0]} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <ScanSearch size={16} className="text-[var(--muted-foreground)]" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-bold">{match.listing.title}</span>
                            <span className="mt-0.5 block text-[0.68rem] font-semibold text-[var(--brand)]">{Math.round(match.score * 100)}% match</span>
                          </span>
                          <ChevronRight size={14} className="shrink-0 text-[var(--muted-foreground)] transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-[var(--muted-foreground)]">Watching new listings for a close match.</p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {showForm && <AlertForm busy={busyId === 'create'} onClose={() => setShowForm(false)} onCreate={createAlert} />}
    </div>
  );
}
