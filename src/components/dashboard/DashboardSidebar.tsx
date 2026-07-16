'use client';

import { useEffect, useState } from 'react';
import {
  Bell,
  LogOut,
  Mail,
  Package,
  Settings,
  UploadCloud,
  User,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { listingsApi, matchesApi, notificationsApi, conversationsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { NameAvatar } from '@/components/ui/name-avatar';

type DashboardSection = 'listings' | 'messages' | 'alerts' | 'upload' | 'profile' | 'settings';

interface DashboardSidebarProps {
  onSelectSection: (section: DashboardSection) => void;
  activeSection: DashboardSection;
}

interface SidebarStats {
  listings: number;
  activeListings: number;
  unreadMessages: number;
  unreadAlerts: number;
  pendingMatches: number;
}

const initialStats: SidebarStats = {
  listings: 0,
  activeListings: 0,
  unreadMessages: 0,
  unreadAlerts: 0,
  pendingMatches: 0,
};

export default function DashboardSidebar({ onSelectSection, activeSection }: DashboardSidebarProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const [stats, setStats] = useState<SidebarStats>(initialStats);

  useEffect(() => {
    if (!isAuthenticated) {
      setStats(initialStats);
      return;
    }

    let cancelled = false;

    async function loadStats() {
      const [listingsResult, notificationsResult, matchesResult, conversationsResult] = await Promise.allSettled([
        listingsApi.getMyListings(),
        notificationsApi.getNotifications(1),
        matchesApi.getMatches(),
        conversationsApi.getConversations(),
      ]);

      if (cancelled) return;

      const listings = listingsResult.status === 'fulfilled' && Array.isArray(listingsResult.value) ? listingsResult.value : [];
      const matches = matchesResult.status === 'fulfilled' && Array.isArray(matchesResult.value) ? matchesResult.value : [];
      const conversations =
        conversationsResult.status === 'fulfilled' && Array.isArray(conversationsResult.value)
          ? conversationsResult.value
          : [];
      const unreadAlerts =
        notificationsResult.status === 'fulfilled'
          ? Number(notificationsResult.value.unreadCount ?? 0)
          : 0;

      setStats({
        listings: listings.length,
        activeListings: listings.filter((listing: { status?: string }) => listing.status === 'ACTIVE').length,
        unreadMessages: conversations.filter((conversation: { messages?: { senderId: string; readAt: string | null }[] }) => {
          const latest = conversation.messages?.[0];
          return Boolean(user && latest && latest.senderId !== user.id && !latest.readAt);
        }).length,
        unreadAlerts,
        pendingMatches: matches.filter((match: { status?: string }) => match.status === 'PENDING').length,
      });
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user]);

  const menuItems: Array<{
    label: string;
    icon: React.ElementType;
    section: DashboardSection;
    count?: number;
    highlight?: boolean;
  }> = [
    { label: 'My Listings', icon: Package, section: 'listings', count: stats.listings },
    { label: 'Messages', icon: Mail, section: 'messages', count: stats.unreadMessages },
    { label: 'Alerts', icon: Bell, section: 'alerts', count: stats.unreadAlerts + stats.pendingMatches },
    { label: 'Upload Item', icon: UploadCloud, section: 'upload', highlight: true },
    { label: 'Profile', icon: User, section: 'profile' },
    { label: 'Settings', icon: Settings, section: 'settings' },
  ];

  const handleSelect = (section: DashboardSection) => {
    onSelectSection(section);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('section', section);
      window.history.replaceState(null, '', url.toString());
    }
  };

  const handleLogout = () => {
    logout();
  };

  const SidebarContent = () => (
    <div className="flex min-h-full flex-col p-5">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
            <span className="font-bold">R</span>
          </div>
          <div>
            <span className="text-xl font-bold text-foreground">Dashboard</span>
            <p className="text-xs text-muted-foreground">Manage your activity</p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card mb-6 rounded-[2rem] p-5 text-[var(--foreground)]"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="relative">
            <NameAvatar name={user?.name ?? 'Remnant'} className="h-14 w-14 text-lg" />
            <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[var(--brand)]" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold">{user?.name ?? 'Remnant user'}</h3>
            <p className="truncate text-xs text-[var(--muted-foreground)]">{user?.email ?? 'Signed in account'}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-[1.25rem] bg-[var(--brand-soft)] p-2">
            <p className="font-bold">{stats.listings}</p>
            <p className="text-[11px] text-[var(--muted-foreground)]">Listings</p>
          </div>
          <div className="rounded-[1.25rem] bg-[#e2f7ff] p-2">
            <p className="font-bold">{stats.pendingMatches}</p>
            <p className="text-[11px] text-[var(--muted-foreground)]">Matches</p>
          </div>
          <div className="rounded-[1.25rem] bg-[#fff6cf] p-2">
            <p className="font-bold">{stats.unreadMessages}</p>
            <p className="text-[11px] text-[var(--muted-foreground)]">Messages</p>
          </div>
        </div>
      </motion.div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.section;

          return (
            <motion.button
              key={item.section}
              type="button"
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(item.section)}
              className={cn(
                'flex w-full items-center justify-between rounded-[1.5rem] p-3 text-left transition-colors',
                active
                  ? 'border border-[var(--border)]/55 bg-white soft-shadow'
                  : 'hover:bg-[var(--sand)]',
                item.highlight && 'ring-1 ring-[var(--brand)]/20',
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    active
                      ? 'bg-[var(--brand-soft)] text-[var(--brand)]'
                      : 'bg-white text-muted-foreground',
                  )}
                >
                  <Icon size={19} />
                </div>
                <span className="truncate text-sm font-medium text-foreground">{item.label}</span>
              </div>

              {typeof item.count === 'number' && item.count > 0 && (
                <span className="ml-2 rounded-full bg-[var(--brand-soft)] px-2 py-1 text-xs font-semibold text-[var(--brand)]">
                  {item.count}
                </span>
              )}

              {item.highlight && (
                <span className="ml-2 rounded-full bg-[var(--brand-soft)] px-2 py-1 text-xs font-semibold text-[var(--brand)]">
                  New
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <div className="mb-4 rounded-[1.5rem] bg-[var(--sand)] p-4">
          <p className="mb-2 text-sm font-medium text-foreground">Quick Stats</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <span>Active: {stats.activeListings}</span>
            <span>Alerts: {stats.unreadAlerts}</span>
            <span>Messages: {stats.unreadMessages}</span>
            <span>Matches: {stats.pendingMatches}</span>
          </div>
        </div>

        <Button type="button" variant="outline" className="w-full rounded-full border-[var(--border)] bg-white font-bold text-red-600 hover:bg-red-50" onClick={handleLogout}>
          <LogOut size={18} />
          Log out
        </Button>
      </div>
    </div>
  );

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-[var(--border)]/45 bg-white md:block">
      <SidebarContent />
    </aside>
  );
}
