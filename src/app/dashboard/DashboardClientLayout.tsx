"use client";

import { useState } from 'react';
import type { UserProfile } from './types';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import OnboardingFlow from './onboarding/OnboardingFlow'; 
import { ToastProvider } from '@/contexts/ToastContext';

type LayoutProps = {
  userProfile: UserProfile;
  children: React.ReactNode;
};

export default function DashboardClientLayout({ userProfile, children }: LayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  // Começa a sidebar recolhida por padrão no desktop
  const [isDesktopCollapsed, setDesktopCollapsed] = useState(true);

  // Se o onboarding não foi concluído, mostra o novo fluxo
  if (!userProfile.has_completed_onboarding) {
    return (
      <ToastProvider>
        <OnboardingFlow userProfile={userProfile} />
      </ToastProvider>
    );
  }

  // Se já concluiu, mostra o dashboard normal
  return (
    <ToastProvider>
      {/* 1. O fundo da página inteira é o roxo da Sidebar */}
      <div className="flex h-screen bg-brand-purple">
        <Sidebar 
          userProfile={userProfile} 
          isMobileOpen={isSidebarOpen} 
          setIsMobileOpen={setSidebarOpen} 
          isDesktopCollapsed={isDesktopCollapsed}
          setIsDesktopCollapsed={setDesktopCollapsed}
        />
        
        {/* 2. O container do conteúdo principal é arredondado
               e tem o seu próprio fundo (claro ou escuro) */}
        <div className={`flex-1 flex flex-col overflow-hidden 
                       bg-bg-secondary dark:bg-bg-primary 
                       transition-all duration-300
                       md:rounded-l-3xl md:my-3 md:ml-0`}
        >
          <Topbar 
            userProfile={userProfile} 
            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
          />
          {/* 3. A área de scroll (main) agora tem o padding 
                 para o conteúdo não ficar colado na Topbar */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}