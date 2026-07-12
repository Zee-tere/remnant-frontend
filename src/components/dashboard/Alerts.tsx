'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Check,
  CheckCircle,
  ExternalLink,
  Heart,
  Info,
  Loader2,
  MessageSquare,
  Package,
  RefreshCw,
  ShoppingBag,
  Star,
  XCircle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { matchesApi, notificationsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'match' | 'message' | 'transaction' | 'review' | 'listing' | 'system';

interface NotificationRecord {
  id: string;
  type: 'PAIR_MATCH' | 'MESSAGE_RECEIVED' | 'TRANSACTION_UPDATE' | 'REVIEW_RECEIVED' | 'LISTING_EXPIRING' | 'SYSTEM';
  title: string;
  body: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

interface MatchRecord {
  id: string;
  score: number;
  status: 'PENDING' | 'VIEWED' | 'DISMISSED' | 'COMPLETED';
  createdAt: string;
  listingA: {
    id: string;
    title: string;
    images?: string[];
    user?: { id: string; name: string; avatarUrl: string | null };
  };
  listingB: {
    id: string;
    title: string;
    images?: string[];
    user?: { id: string; name: string; avatarUrl: string | null };
  };
}

type ActivityItem =
  | {
      source: 'notification';
      id: string;
      type: FilterType;
      title: string;
      description: string;
      href?: string | null;
      unread: boolean;
      createdAt: string;
      raw: NotificationRecord;
    }
  | {
      source: 'match';
      id: string;
      type: 'match';
      title: string;
      description: string;
      href: string;
      unread: boolean;
      createdAt: string;
      score: number;
      raw: MatchRecord;
    };

const filterLabels: Record<FilterType, string> = {
  all: 'All',
  match: 'Matches',
  message: 'Messages',
  transaction: 'Transactions',
  review: 'Reviews',
  listing: 'Listings',
  system: 'System',
};

const alertConfig: Record<FilterType, { icon: React.ElementType; className: string; borderClass: string }> = {
  all: {
    icon: Bell,
    className: 'bg-[var(--brand-soft)] text-[var(--brand)] dark:bg-[var(--brand-muted)]',
    borderClass: 'border-l-[var(--brand)]',
  },
  match: {
    icon: Heart,
    className: 'bg-[var(--brand-soft)] text-[var(--brand)] dark:bg-[var(--brand-muted)]',
    borderClass: 'border-l-[var(--brand)]',
  },
  message: {
    icon: MessageSquare,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    borderClass: 'border-l-blue-500',
  },
  transaction: {
    icon: ShoppingBag,
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    borderClass: 'border-l-emerald-500',
  },
  review: {
    icon: Star,
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    borderClass: 'border-l-amber-500',
  },
  listing: {
    icon: Package,
    className: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    borderClass: 'border-l-neutral-500',
  },
  system: {
    icon: Info,
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
    borderClass: 'border-l-slate-500',
  },
};

const notificationTypeMap: Record<NotificationRecord['type'], FilterType> = {
  PAIR_MATCH: 'match',
  MESSAGE_RECEIVED: 'message',
  TRANSACTION_UPDATE: 'transaction',
  REVIEW_RECEIVED: 'review',
  LISTING_EXPIRING: 'listing',
  SYSTEM: 'system',
};

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
}

export default function AlertsSection() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadActivity = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setMatches([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [notificationsResult, matchesResult] = await Promise.allSettled([
        notificationsApi.getNotifications(1),
        matchesApi.getMatches(),
      ]);

      if (notificationsResult.status === 'fulfilled') {
        setNotifications(Array.isArray(notificationsResult.value.notifications) ? notificationsResult.value.notifications : []);
      } else {
        setNotifications([]);
      }

      if (matchesResult.status === 'fulfilled') {
        setMatches(Array.isArray(matchesResult.value) ? matchesResult.value : []);
      } else {
        setMatches([]);
      }
    } catch {
      setNotifications([]);
      setMatches([]);
      toast.error('Could not load alerts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  const activityItems = useMemo<ActivityItem[]>(() => {
    const notificationItems: ActivityItem[] = notifications.map((notification) => ({
      source: 'notification',
      id: notification.id,
      type: notificationTypeMap[notification.type] ?? 'system',
      title: notification.title,
      description: notification.body,
      href: notification.link,
      unread: !notification.isRead,
      createdAt: notification.createdAt,
      raw: notification,
    }));

    const matchItems: ActivityItem[] = matches
      .filter((match) => match.status !== 'DISMISSED')
      .map((match) => ({
        source: 'match',
        id: match.id,
        type: 'match',
        title: 'Pair match found',
        description: `${match.listingA.title} may match ${match.listingB.title}`,
        href: `/marketplace/${match.listingB.id}`,
        unread: match.status === 'PENDING',
        createdAt: match.createdAt,
        score: Math.round(match.score * 100),
        raw: match,
      }));

    return [...notificationItems, ...matchItems].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [matches, notifications]);

  const filteredItems = activityItems.filter((item) => filter === 'all' || item.type === filter);
  const unreadCount = activityItems.filter((item) => item.unread).length;
  const pendingMatches = matches.filter((match) => match.status === 'PENDING').length;

  const stats = [
    { label: 'Unread', value: unreadCount, icon: Bell, className: alertConfig.match.className },
    { label: 'Pending Matches', value: pendingMatches, icon: Heart, className: alertConfig.match.className },
    {
      label: 'Messages',
      value: activityItems.filter((item) => item.type === 'message').length,
      icon: MessageSquare,
      className: alertConfig.message.className,
    },
    {
      label: 'Transactions',
      value: activityItems.filter((item) => item.type === 'transaction').length,
      icon: ShoppingBag,
      className: alertConfig.transaction.className,
    },
  ];

  const markNotificationRead = async (id: string) => {
    setNotifications((current) =>
      current.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
    );
    try {
      await notificationsApi.markAsRead(id);
    } catch {
      toast.error('Could not update notification');
      loadActivity();
    }
  };

  const updateMatchStatus = async (id: string, status: 'VIEWED' | 'DISMISSED') => {
    setMatches((current) =>
      current.map((match) => (match.id === id ? { ...match, status } : match)),
    );
    try {
      await matchesApi.updateMatchStatus(id, status);
    } catch {
      toast.error('Could not update match');
      loadActivity();
    }
  };

  const markAllAsRead = async () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
    setMatches((current) =>
      current.map((match) => (match.status === 'PENDING' ? { ...match, status: 'VIEWED' } : match)),
    );

    try {
      await Promise.all([
        notificationsApi.markAllAsRead(),
        ...matches.filter((match) => match.status === 'PENDING').map((match) => matchesApi.updateMatchStatus(match.id, 'VIEWED')),
      ]);
      toast.success('Alerts marked as read');
    } catch {
      toast.error('Some alerts could not be updated');
      loadActivity();
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
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Alerts</h1>
            <p className="text-sm text-muted-foreground">Real notifications and match activity from the API</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={unreadCount === 0}
            onClick={markAllAsRead}
            className="border-[var(--border)]"
          >
            <Check size={16} />
            Mark all read
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setRefreshing(true);
              loadActivity();
            }}
            className="border-[var(--border)]"
          >
            {refreshing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
            Refresh
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-[var(--border)] bg-card">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={cn('rounded-full p-3', stat.className)}>
                <stat.icon size={22} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-card p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(filterLabels) as FilterType[]).map((filterType) => {
            const Icon = alertConfig[filterType].icon;
            const active = filter === filterType;
            return (
              <Button
                key={filterType}
                type="button"
                variant={active ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filterType)}
                className={active ? '' : 'border-[var(--border)]'}
              >
                {filterType !== 'all' && <Icon size={15} />}
                {filterLabels[filterType]}
              </Button>
            );
          })}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <Card className="border-[var(--border)] bg-card">
          <CardContent className="flex flex-col items-center px-6 py-14 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-soft)]">
              <Bell className="text-[var(--brand)]" size={30} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No alerts here</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              New messages, pair matches, and account updates will appear here once the backend sends them.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {filteredItems.map((item, index) => {
              const config = alertConfig[item.type];
              const Icon = config.icon;

              return (
                <motion.div
                  key={`${item.source}-${item.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.02 }}
                  layout
                >
                  <Card
                    className={cn(
                      'border-l-4 border-y-[var(--border)] border-r-[var(--border)] bg-card transition-shadow hover:shadow-md',
                      config.borderClass,
                      item.unread && 'ring-2 ring-[var(--brand)]/15',
                    )}
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 gap-3">
                          <div className={cn('mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full', config.className)}>
                            <Icon size={21} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-foreground">{item.title}</h3>
                              {item.unread && <Badge className="bg-[var(--brand)] text-[var(--navy)]">New</Badge>}
                              {item.source === 'match' && (
                                <Badge variant="outline" className="border-[var(--border)]">
                                  {item.score}% match
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                            <p className="mt-3 text-xs text-muted-foreground">{formatTime(item.createdAt)}</p>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                          {item.href && (
                            <Button type="button" size="sm" asChild>
                              <Link href={item.href}>
                                <ExternalLink size={15} />
                                View
                              </Link>
                            </Button>
                          )}
                          {item.source === 'notification' && item.unread && (
                            <Button type="button" variant="outline" size="sm" onClick={() => markNotificationRead(item.id)}>
                              <CheckCircle size={15} />
                              Read
                            </Button>
                          )}
                          {item.source === 'match' && item.unread && (
                            <Button type="button" variant="outline" size="sm" onClick={() => updateMatchStatus(item.id, 'VIEWED')}>
                              <CheckCircle size={15} />
                              Read
                            </Button>
                          )}
                          {item.source === 'match' && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => updateMatchStatus(item.id, 'DISMISSED')}
                            >
                              <XCircle size={15} />
                              Dismiss
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
