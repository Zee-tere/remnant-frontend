'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Bell, Check, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { notificationsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { getApiErrorMessage } from '@/lib/errors';
import { DashboardSectionLoading } from '@/components/feedback/LoadingState';
import { cn } from '@/lib/utils';

interface MatchNotification {
  id: string;
  type: 'PAIR_MATCH';
  title: string;
  body: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1_440) return `${Math.floor(minutes / 60)}h ago`;
  if (minutes < 10_080) return `${Math.floor(minutes / 1_440)}d ago`;
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

export default function AlertsSection() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [notifications, setNotifications] = useState<MatchNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAlerts = useCallback(async (quiet = false) => {
    if (!isAuthenticated) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    if (!quiet) setLoading(true);
    try {
      const result = await notificationsApi.getNotifications(1);
      const rows = Array.isArray(result.notifications) ? result.notifications : [];
      setNotifications(rows.filter((item: MatchNotification) => item.type === 'PAIR_MATCH'));
    } catch (error) {
      if (!quiet) toast.error(getApiErrorMessage(error, 'Could not load match alerts'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);
  const newItems = notifications.filter((item) => !item.isRead);
  const earlierItems = notifications.filter((item) => item.isRead);

  const markRead = async (id: string) => {
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, isRead: true } : item));
    window.dispatchEvent(new Event('remnant:summary-refresh'));
    try {
      await notificationsApi.markAsRead(id);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not update this match'));
      void loadAlerts(true);
    }
  };

  const markAllRead = async () => {
    setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    window.dispatchEvent(new Event('remnant:summary-refresh'));
    try {
      await notificationsApi.markAllAsRead();
      toast.success('Match alerts marked as read');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not update your match alerts'));
      void loadAlerts(true);
    }
  };

  if (loading) return <DashboardSectionLoading label="Checking for matches" />;

  const renderGroup = (title: string, items: MatchNotification[]) => items.length > 0 && (
    <section aria-labelledby={`match-alerts-${title.toLowerCase()}`}>
      <h2 id={`match-alerts-${title.toLowerCase()}`} className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
        {title}
      </h2>
      <div className="overflow-hidden rounded-card border border-[var(--border)] bg-white">
        {items.map((item) => (
          <article key={item.id} className={cn('flex gap-3 border-b border-[var(--line-soft)] p-4 last:border-b-0 md:gap-4 md:p-5', !item.isRead && 'bg-[var(--warm-white)]')}>
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-[var(--border)] text-[var(--brand)]">
              <Sparkles size={17} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground md:text-base">{item.title || 'A likely match was found'}</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">{item.body}</p>
                </div>
                {!item.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--brand)]" aria-label="Unread" />}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <time className="text-xs text-[var(--muted-foreground)]" dateTime={item.createdAt}>{formatTime(item.createdAt)}</time>
                {item.link ? (
                  <Button asChild variant="link" size="sm" className="h-auto px-0 font-bold text-[var(--brand)] no-underline">
                    <Link href={item.link} onClick={() => !item.isRead && void markRead(item.id)}>View match <ArrowUpRight size={14} /></Link>
                  </Button>
                ) : !item.isRead ? (
                  <button type="button" onClick={() => void markRead(item.id)} className="text-xs font-bold text-[var(--brand)]">Mark as read</button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex items-start justify-between gap-4 border-b border-[var(--line-soft)] pb-5">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-[var(--border)] text-[var(--brand)]">
            <Bell size={19} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Match alerts</h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--ink-soft)]">
              Likely matches for your listings and saved searches appear here.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {unreadCount > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => void markAllRead()}>
              <Check size={15} /><span className="hidden sm:inline">Mark all read</span>
            </Button>
          )}
          <Button type="button" variant="ghost" size="icon" aria-label="Refresh match alerts" onClick={() => { setRefreshing(true); void loadAlerts(true); }}>
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </Button>
        </div>
      </header>

      {notifications.length === 0 ? (
        <div className="rounded-card border border-dashed border-[var(--border)] bg-white px-6 py-14 text-center">
          <Sparkles className="mx-auto text-[var(--brand)]" size={28} aria-hidden="true" />
          <h2 className="mt-4 text-lg font-bold text-foreground">No matches yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--ink-soft)]">
            When Remnant finds a likely fit for one of your listings or saved searches, it will appear here.
          </p>
          <Button asChild variant="outline" className="mt-5"><Link href="/find-a-pair">Search the marketplace</Link></Button>
        </div>
      ) : (
        <div className="space-y-6">
          {renderGroup('New', newItems)}
          {renderGroup('Earlier', earlierItems)}
        </div>
      )}
    </div>
  );
}
