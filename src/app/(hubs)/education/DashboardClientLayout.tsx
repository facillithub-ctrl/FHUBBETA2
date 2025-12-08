"use client";

import { useState } from 'react';
import type { UserProfile } from './types';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import Onboarding from './onboarding/OnboardingFlow';
import { ToastProvider } from '@/contexts/ToastContext';

type LayoutProps = {
  userProfile: UserProfile;
  children: React.ReactNode;
};

export default function DashboardClientLayout({ userProfile, children }: LayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setDesktopCollapsed] = useState(false);

  if (!userProfile) return null;

  if (!userProfile.has_completed_onboarding) {
    return (
      <ToastProvider>
        <Onboarding userProfile={userProfile} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="flex h-screen bg-background-light dark:bg-gray-900">
        <Sidebar 
          userProfile={userProfile} 
          isMobileOpen={isSidebarOpen} 
          setIsMobileOpen={setSidebarOpen}
          isDesktopCollapsed={isDesktopCollapsed}
          setIsDesktopCollapsed={setDesktopCollapsed}
        />
        <div className="flex-1 flex flex-col overflow-hidden h-full relative">
          {/* CORREÇÃO AQUI: onToggleSidebar */}
          <Topbar 
            userProfile={userProfile} 
            onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}