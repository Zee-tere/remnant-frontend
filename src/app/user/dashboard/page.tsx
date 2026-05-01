'use client';

import { useState } from 'react';
import UploadItem from '@/components/dashboard/UploadItem';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ListingsSection from '@/components/dashboard/Listings';
import MessagesSection from '@/components/dashboard/Messages';
import AlertsSection from '@/components/dashboard/Alerts';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';


export default function UserDashboard() {
  const [activeSection, setActiveSection] = useState<'listings' | 'messages' | 'alerts' | 'upload' | 'profile' | 'settings'>('listings');

  const renderSection = () => {
    switch (activeSection) {
      case 'listings':
        return <ListingsSection />;
      case 'messages':
        return <MessagesSection />;
      case 'alerts':
        return <AlertsSection />;
      case 'upload':
        return <UploadItem />;
      default:
        return <ListingsSection />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-sans">
      {/* Sidebar */}
      <DashboardSidebar onSelectSection={setActiveSection} activeSection={activeSection} />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 p-4 md:p-10 transition-all duration-300 overflow-y-auto"
      >
        {renderSection()}

        <div className="mt-10 text-center">
          <Button variant="outline" onClick={() => setActiveSection('upload')}>
            + Upload New Item
          </Button>
        </div>
      </motion.div>

      <Toaster position="top-center" />
    </div>
  );
}
