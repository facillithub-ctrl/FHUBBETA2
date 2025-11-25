"use client";

import { useState } from 'react';
import type { UserProfile, UserStats } from './types';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
// CORREÇÃO: O nome do arquivo é OnboardingFlow, não Onboarding
import Onboarding from './onboarding/OnboardingFlow'; 
import { ToastProvider } from '@/contexts/ToastContext';

type LayoutProps = {
  userProfile: UserProfile;
  stats: UserStats;
  children: React.ReactNode;
};

export default function DashboardClientLayout({ userProfile, stats, children }: LayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setDesktopCollapsed] = useState(false);

  // Verifica se o usuário precisa passar pelo Onboarding
  if (!userProfile.has_completed_onboarding) {
    return (
      <ToastProvider>
        {/* Renderiza o fluxo de Onboarding se não estiver completo */}
        <Onboarding userProfile={userProfile} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar 
          userProfile={userProfile}
          stats={stats}
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
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
} 