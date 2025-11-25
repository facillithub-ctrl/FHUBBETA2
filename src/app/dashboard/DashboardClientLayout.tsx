// src/app/dashboard/DashboardClientLayout.tsx
"use client";

import { useState } from 'react';
import type { UserProfile, UserStats } from './types'; // Importe UserStats
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import Onboarding from './onboarding/Onboarding';
import { ToastProvider } from '@/contexts/ToastContext';

type LayoutProps = {
  userProfile: UserProfile;
  stats: UserStats; // ✅ ADICIONADO: Propriedade obrigatória
  children: React.ReactNode;
};

export default function DashboardClientLayout({ userProfile, stats, children }: LayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setDesktopCollapsed] = useState(false);

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
          stats={stats} // ✅ ADICIONADO: Passando stats para a Sidebar
          isMobileOpen={isSidebarOpen} 
          setIsMobileOpen={setSidebarOpen} 
          isDesktopCollapsed={isDesktopCollapsed}
          setIsDesktopCollapsed={setDesktopCollapsed}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar 
            userProfile={userProfile} 
            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}