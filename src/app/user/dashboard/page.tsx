'use client';

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ListingsSection from '@/components/dashboard/Listings';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/auth';

type DashboardSection = 'listings' | 'pair-alerts' | 'messages' | 'alerts' | 'upload' | 'profile' | 'settings';

const dashboardSections: DashboardSection[] = ['listings', 'pair-alerts', 'messages', 'alerts', 'upload', 'profile', 'settings'];

const SectionLoading = () => (
  <div className="flex min-h-[18rem] items-center justify-center">
    <Loader2 className="animate-spin text-[var(--brand)]" size={26} />
  </div>
);

const UploadItem = dynamic(() => import('@/components/dashboard/UploadItem'), { loading: SectionLoading });
const MessagesSection = dynamic(() => import('@/components/dashboard/Messages'), { loading: SectionLoading });
const AlertsSection = dynamic(() => import('@/components/dashboard/Alerts'), { loading: SectionLoading });
const PairAlertsSection = dynamic(() => import('@/components/dashboard/PairAlerts'), { loading: SectionLoading });
const ProfileSection = dynamic(() => import('@/components/dashboard/ProfileSection'), { loading: SectionLoading });
const SettingsSection = dynamic(() => import('@/components/dashboard/SettingsSection'), { loading: SectionLoading });

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
      case 'pair-alerts':
        return <PairAlertsSection />;
      case 'alerts':
        return <AlertsSection />;
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
    <div className={`flex bg-[var(--background)] text-[var(--foreground)] ${activeSection === 'messages' ? 'h-full min-h-0 md:min-h-screen' : 'min-h-screen'}`}>
      <DashboardSidebar onSelectSection={handleSelectSection} activeSection={activeSection} />

      <div
        key={activeSection}
        className={`dashboard-section-entry min-w-0 flex-1 ${
          activeSection === 'messages'
            ? 'overflow-hidden px-0 pb-0 pt-0 md:overflow-y-auto md:p-8 lg:p-10'
            : 'overflow-y-auto px-3 pb-8 pt-3 md:p-8 lg:p-10'
        }`}
      >
        {renderSection()}

        {activeSection === 'listings' && (
          <div className="mt-6 text-center md:mt-10">
            <Button variant="outline" onClick={() => handleSelectSection('upload')} className="rounded-full border-[var(--border)] bg-white font-bold">
              Upload New Item
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
