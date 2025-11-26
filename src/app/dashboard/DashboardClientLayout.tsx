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
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Mobile
  const [isDesktopCollapsed, setDesktopCollapsed] = useState(false); // Desktop

  if (!userProfile.has_completed_onboarding) {
    return (
      <ToastProvider>
        <Onboarding userProfile={userProfile} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="flex h-screen bg-background-light dark:bg-gray-900 overflow-hidden">
        {/* Sidebar recebe o estado e a função para alterar */}
        <Sidebar 
          userProfile={userProfile} 
          isMobileOpen={isSidebarOpen} 
          setIsMobileOpen={setSidebarOpen} 
          isDesktopCollapsed={isDesktopCollapsed}
          setIsDesktopCollapsed={setDesktopCollapsed}
        />
        
        {/* Conteúdo Principal (flex-1 faz ele ocupar o espaço restante) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300">
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