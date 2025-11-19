"use client";

import { useState } from 'react';
import type { UserProfile } from './types';
import type { UserStats } from './data-access'; // Importar tipo
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import OnboardingFlow from './onboarding/OnboardingFlow'; 
import { ToastProvider } from '@/contexts/ToastContext';

type LayoutProps = {
  userProfile: UserProfile;
  stats: UserStats; // Nova prop
  children: React.ReactNode;
};

export default function DashboardClientLayout({ userProfile, stats, children }: LayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setDesktopCollapsed] = useState(true);

  // Se onboarding incompleto, mostra fluxo de entrada
  if (!userProfile.has_completed_onboarding) {
    return (
      <ToastProvider>
        <OnboardingFlow userProfile={userProfile} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="flex h-screen bg-brand-purple">
        <Sidebar 
          userProfile={userProfile} 
          isMobileOpen={isSidebarOpen} 
          setIsMobileOpen={setSidebarOpen} 
          isDesktopCollapsed={isDesktopCollapsed}
          setIsDesktopCollapsed={setDesktopCollapsed}
        />
        
        {/* Adicionamos 'relative' para que elementos absolutos dentro da Topbar/Main 
           fiquem contidos aqui se necessário.
        */}
        <div className={`flex-1 flex flex-col overflow-hidden 
                       bg-bg-secondary dark:bg-bg-primary 
                       transition-all duration-300
                       md:rounded-l-3xl md:my-3 md:ml-0 relative`}
        >
          <Topbar 
            userProfile={userProfile} 
            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
            stats={stats} // Passamos os dados cacheados
          />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 scroll-smooth">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}