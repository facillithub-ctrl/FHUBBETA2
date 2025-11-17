"use client";

import { useState } from 'react';
import type { UserProfile } from './types';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
// 1. IMPORTAÇÃO ATUALIZADA
import OnboardingFlow from './onboarding/OnboardingFlow'; // Importa o novo gestor de fluxo
import { ToastProvider } from '@/contexts/ToastContext';

type LayoutProps = {
  userProfile: UserProfile;
  children: React.ReactNode;
};

export default function DashboardClientLayout({ userProfile, children }: LayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setDesktopCollapsed] = useState(false);

  // Se o onboarding não foi concluído, mostra o novo fluxo de 8 etapas
  if (!userProfile.has_completed_onboarding) {
    return (
      <ToastProvider>
        {/* 2. COMPONENTE RENDERIZADO ATUALIZADO */}
        <OnboardingFlow userProfile={userProfile} />
      </ToastProvider>
    );
  }

  // Se já concluiu, mostra o dashboard normal
  return (
    <ToastProvider>
      <div className="flex h-screen bg-bg-primary dark:bg-bg-primary">
        <Sidebar 
          userProfile={userProfile} 
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
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 bg-bg-secondary dark:bg-bg-primary">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}