"use client";

import { useState } from 'react';
import type { UserProfile } from '@/app/dashboard/types';
import AdminSidebar from './AdminSidebar'; // Usa a sidebar exclusiva que criamos
import Topbar from '@/components/dashboard/Topbar'; // Reutiliza a Topbar existente
import { ToastProvider } from '@/contexts/ToastContext';

type AdminClientLayoutProps = {
  userProfile: UserProfile;
  children: React.ReactNode;
};

export default function AdminClientLayout({ userProfile, children }: AdminClientLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="flex h-screen bg-background-light dark:bg-gray-900">
        {/* Sidebar Específica do Admin */}
        <AdminSidebar 
          isMobileOpen={isSidebarOpen} 
          setIsMobileOpen={setSidebarOpen} 
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar comum (pode ser substituída por uma AdminTopbar se precisar de ações diferentes) */}
          <Topbar 
            userProfile={userProfile} 
            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
          />
          
          {/* Área de Conteúdo Principal */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}