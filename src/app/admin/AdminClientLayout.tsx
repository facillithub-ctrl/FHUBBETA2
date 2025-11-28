"use client";

import { useState } from 'react';
import type { UserProfile } from '@/app/dashboard/types';
import AdminSidebar from './AdminSidebar';
import Topbar from '@/components/dashboard/Topbar';
import { ToastProvider } from '@/contexts/ToastContext';

type AdminClientLayoutProps = {
  userProfile: UserProfile;
  children: React.ReactNode;
};

export default function AdminClientLayout({ userProfile, children }: AdminClientLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans">
        <AdminSidebar 
          isMobileOpen={isSidebarOpen} 
          setIsMobileOpen={setSidebarOpen} 
        />
        
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* CORREÇÃO AQUI: onToggleSidebar em vez de toggleSidebar */}
          <Topbar 
            userProfile={userProfile} 
            onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
          />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-8 scroll-smooth">
            <div className="max-w-7xl mx-auto min-h-[calc(100vh-8rem)]">
               {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}