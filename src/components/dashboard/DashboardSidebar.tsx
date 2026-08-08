'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Bell,
  LogOut,
  Mail,
  Package,
  ScanSearch,
  Settings,
  UploadCloud,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { NameAvatar } from '@/components/ui/name-avatar';

type DashboardSection = 'listings' | 'pair-alerts' | 'messages' | 'alerts' | 'upload' | 'profile' | 'settings';

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

  const loadStats = useCallback(async () => {
    if (!isAuthenticated) {
      setStats(initialStats);
      return;
    }
    try {
      const summary = await userApi.getDashboardSummary();
      setStats({
        listings: Number(summary.listings ?? 0),
        activeListings: Number(summary.activeListings ?? 0),
        unreadMessages: Number(summary.unreadMessages ?? 0),
        unreadAlerts: Number(summary.unreadAlerts ?? 0),
        pendingMatches: Number(summary.pendingMatches ?? 0),
      });
    } catch {
      setStats(initialStats);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadStats();
    const refresh = () => void loadStats();
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener('focus', refresh);
    window.addEventListener('remnant:summary-refresh', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('remnant:summary-refresh', refresh);
    };
  }, [loadStats]);

  const menuItems: Array<{
    label: string;
    icon: React.ElementType;
    section: DashboardSection;
    count?: number;
    highlight?: boolean;
  }> = [
    { label: 'My Listings', icon: Package, section: 'listings', count: stats.listings },
    { label: 'Pair Alerts', icon: ScanSearch, section: 'pair-alerts' },
    { label: 'Messages', icon: Mail, section: 'messages', count: stats.unreadMessages },
    { label: 'Match alerts', icon: Bell, section: 'alerts', count: stats.unreadAlerts },
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
          <div className="flex h-10 w-10 items-center justify-center text-[var(--brand)]">
            <span className="font-bold">R</span>
          </div>
          <div>
            <span className="text-xl font-bold text-foreground">Dashboard</span>
            <p className="text-xs text-muted-foreground">Manage your activity</p>
          </div>
        </div>
      </div>

      <div className="mb-6 border-y border-[#f1f0ec] py-5 text-[var(--foreground)]">
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

        <div className="grid grid-cols-3 divide-x divide-[#f1f0ec] text-center">
          <div className="p-2">
            <p className="font-bold">{stats.listings}</p>
            <p className="text-[11px] text-[var(--muted-foreground)]">Listings</p>
          </div>
          <div className="p-2">
            <p className="font-bold">{stats.pendingMatches}</p>
            <p className="text-[11px] text-[var(--muted-foreground)]">Matches</p>
          </div>
          <div className="p-2">
            <p className="font-bold">{stats.unreadMessages}</p>
            <p className="text-[11px] text-[var(--muted-foreground)]">Messages</p>
          </div>
        </div>
      </div>

      <nav className="divide-y divide-[#f4f3ef]">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.section;

          return (
            <button
              key={item.section}
              type="button"
              onClick={() => handleSelect(item.section)}
              className={cn(
                'flex w-full items-center justify-between p-3 text-left transition-colors',
                active
                  ? 'text-[var(--brand)]'
                  : 'hover:text-[var(--brand)]',
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    active
                      ? 'text-[var(--brand)]'
                      : 'text-muted-foreground',
                  )}
                >
                  <Icon size={19} />
                </div>
                <span className="truncate text-sm font-medium text-foreground">{item.label}</span>
              </div>

              {typeof item.count === 'number' && item.count > 0 && (
                <span className="ml-2 px-1 text-xs font-semibold text-[var(--brand)]">
                  {item.count}
                </span>
              )}

              {item.highlight && (
                <span className="ml-2 px-1 text-xs font-semibold text-[var(--brand)]">
                  New
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <div className="mb-4 border-y border-[#f1f0ec] py-4">
          <p className="mb-2 text-sm font-medium text-foreground">Quick Stats</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <span>Active: {stats.activeListings}</span>
            <span>New matches: {stats.unreadAlerts}</span>
            <span>Messages: {stats.unreadMessages}</span>
            <span>Matches: {stats.pendingMatches}</span>
          </div>
        </div>

        <Button type="button" variant="link" className="w-full justify-start px-0 font-bold text-red-600 no-underline hover:text-red-700" onClick={handleLogout}>
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
