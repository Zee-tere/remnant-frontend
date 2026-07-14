'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import UploadItem from '@/components/dashboard/UploadItem';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ListingsSection from '@/components/dashboard/Listings';
import MessagesSection from '@/components/dashboard/Messages';
import AlertsSection from '@/components/dashboard/Alerts';
import TransactionsSection from '@/components/dashboard/Transactions';
import ProfileSection from '@/components/dashboard/ProfileSection';
import SettingsSection from '@/components/dashboard/SettingsSection';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/auth';

type DashboardSection = 'listings' | 'messages' | 'alerts' | 'transactions' | 'upload' | 'profile' | 'settings';

const dashboardSections: DashboardSection[] = ['listings', 'messages', 'alerts', 'transactions', 'upload', 'profile', 'settings'];

function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="animate-spin text-[var(--brand)]" size={30} />
    </div>
  );
}

export default function UserDashboard() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <UserDashboardContent />
    </Suspense>
  );
}

function UserDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [activeSection, setActiveSection] = useState<DashboardSection>('listings');

  useEffect(() => {
    const requestedSection = searchParams.get('section') as DashboardSection | null;
    if (requestedSection && dashboardSections.includes(requestedSection)) {
      setActiveSection(requestedSection);
    } else {
      setActiveSection('listings');
    }
  }, [searchParams]);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  const handleSelectSection = (section: DashboardSection) => {
    setActiveSection(section);
    const href = section === 'listings' ? '/user/dashboard' : `/user/dashboard?section=${section}`;
    router.replace(href, { scroll: false });
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'listings':
        return <ListingsSection onSelectSection={handleSelectSection} />;
      case 'messages':
        return <MessagesSection />;
      case 'alerts':
        return <AlertsSection />;
      case 'transactions':
        return <TransactionsSection />;
      case 'upload':
        return <UploadItem />;
      case 'profile':
        return <ProfileSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <ListingsSection onSelectSection={handleSelectSection} />;
    }
  };

  if (!hasHydrated || !isAuthenticated) return <DashboardLoading />;

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <DashboardSidebar onSelectSection={handleSelectSection} activeSection={activeSection} />

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="min-w-0 flex-1 overflow-y-auto p-4 pt-24 transition-all duration-300 md:p-8 lg:p-10"
      >
        {renderSection()}

        {activeSection !== 'upload' && (
          <div className="mt-10 text-center">
            <Button variant="outline" onClick={() => handleSelectSection('upload')} className="rounded-full border-[var(--border)] bg-white font-bold">
              Upload New Item
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
